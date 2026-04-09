package com.project.back_end.controller;

import com.project.back_end.dto.LoginDTO;
import com.project.back_end.models.Appointment;
import com.project.back_end.models.Doctor;
import com.project.back_end.service.AppointmentService;
import com.project.back_end.service.DoctorService;
import com.project.back_end.service.TokenService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/doctors")
public class DoctorController {

    @Autowired
    private DoctorService doctorService;

    @Autowired
    private AppointmentService appointmentService;

    @Autowired
    private TokenService tokenService;

    // --- Helper: validate token ---

    private ResponseEntity<Map<String, String>> unauthorized() {
        Map<String, String> error = new HashMap<>();
        error.put("message", "Invalid or missing token");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }

    // --- Login ---

    @PostMapping("/login")
    public ResponseEntity<Map<String, String>> login(@RequestBody LoginDTO loginDTO) {
        String token = doctorService.login(loginDTO);

        if (token == null) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Invalid email or password");
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
        }

        Map<String, String> response = new HashMap<>();
        response.put("token", token);
        response.put("role", "doctor");
        return ResponseEntity.ok(response);
    }

    // --- CRUD (token-protected) ---

    @GetMapping
    public ResponseEntity<?> getAllDoctors(@RequestParam String token) {
        if (!tokenService.isValidToken(token)) {
            return unauthorized();
        }
        return ResponseEntity.ok(doctorService.getAllDoctors());
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getDoctorById(@PathVariable Long id, @RequestParam String token) {
        if (!tokenService.isValidToken(token)) {
            return unauthorized();
        }
        Optional<Doctor> doctor = doctorService.getDoctorById(id);
        return doctor.map(d -> ResponseEntity.ok((Object) d))
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/search")
    public ResponseEntity<?> searchDoctors(@RequestParam String name, @RequestParam String token) {
        if (!tokenService.isValidToken(token)) {
            return unauthorized();
        }
        return ResponseEntity.ok(doctorService.searchByName(name));
    }

    @GetMapping("/filter")
    public ResponseEntity<?> filterDoctors(
            @RequestParam(required = false) String specialty,
            @RequestParam(required = false) String time,
            @RequestParam String token) {
        if (!tokenService.isValidToken(token)) {
            return unauthorized();
        }
        if (specialty != null && !specialty.isEmpty()) {
            List<Doctor> doctors = doctorService.filterBySpecialty(specialty);
            if (time != null && !time.isEmpty()) {
                doctors = doctors.stream()
                        .filter(d -> d.getAvailableTimes() != null
                                && d.getAvailableTimes().stream().anyMatch(t -> t.contains(time)))
                        .collect(Collectors.toList());
            }
            return ResponseEntity.ok(doctors);
        }
        if (time != null && !time.isEmpty()) {
            List<Doctor> allDoctors = doctorService.getAllDoctors();
            List<Doctor> filtered = allDoctors.stream()
                    .filter(d -> d.getAvailableTimes() != null
                            && d.getAvailableTimes().stream().anyMatch(t -> t.contains(time)))
                    .collect(Collectors.toList());
            return ResponseEntity.ok(filtered);
        }
        return ResponseEntity.ok(doctorService.getAllDoctors());
    }

    @PostMapping
    public ResponseEntity<?> createDoctor(@Valid @RequestBody Doctor doctor, @RequestParam String token) {
        if (!tokenService.validateTokenForRole(token, "admin")) {
            return unauthorized();
        }
        Doctor created = doctorService.createDoctor(doctor);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateDoctor(@PathVariable Long id, @Valid @RequestBody Doctor doctor,
                                          @RequestParam String token) {
        if (!tokenService.validateTokenForRole(token, "admin")) {
            return unauthorized();
        }
        Doctor updated = doctorService.updateDoctor(id, doctor);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteDoctor(@PathVariable Long id, @RequestParam String token) {
        if (!tokenService.validateTokenForRole(token, "admin")) {
            return unauthorized();
        }
        doctorService.deleteDoctor(id);
        return ResponseEntity.noContent().build();
    }

    // --- Doctor's Appointments (token-protected) ---

    @GetMapping("/{id}/appointments")
    public ResponseEntity<?> getDoctorAppointments(
            @PathVariable Long id,
            @RequestParam(required = false) String date,
            @RequestParam String token) {
        if (!tokenService.isValidToken(token)) {
            return unauthorized();
        }
        if (date != null && !date.isEmpty()) {
            LocalDate localDate = LocalDate.parse(date);
            return ResponseEntity.ok(appointmentService.getAppointmentsByDoctorAndDate(id, localDate));
        }
        return ResponseEntity.ok(appointmentService.getAppointmentsByDoctor(id));
    }

    // --- Doctor Availability Endpoint ---
    // URL: /api/doctors/{doctorId}/availability/{date}?user={role}&token={token}

    @GetMapping("/{doctorId}/availability/{date}")
    public ResponseEntity<?> getDoctorAvailability(
            @PathVariable Long doctorId,
            @PathVariable String date,
            @RequestParam String user,
            @RequestParam String token) {

        // Validate token for the specified role
        if (!tokenService.validateTokenForRole(token, user)) {
            return unauthorized();
        }

        // Find the doctor
        Optional<Doctor> doctorOpt = doctorService.getDoctorById(doctorId);
        if (doctorOpt.isEmpty()) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Doctor not found");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
        }

        Doctor doctor = doctorOpt.get();
        LocalDate localDate = LocalDate.parse(date);

        // Get existing appointments for that doctor on the given date
        List<Appointment> existingAppointments =
                appointmentService.getAppointmentsByDoctorAndDate(doctorId, localDate);

        // Extract booked time slots
        List<String> bookedSlots = existingAppointments.stream()
                .map(a -> {
                    String startHour = String.format("%02d:00", a.getAppointmentTime().getHour());
                    String endHour = String.format("%02d:00", a.getAppointmentTime().getHour() + 1);
                    return startHour + "-" + endHour;
                })
                .collect(Collectors.toList());

        // Calculate available slots by removing booked ones from doctor's schedule
        List<String> allSlots = doctor.getAvailableTimes() != null
                ? doctor.getAvailableTimes() : List.of();
        List<String> availableSlots = allSlots.stream()
                .filter(slot -> !bookedSlots.contains(slot))
                .collect(Collectors.toList());

        // Build response
        Map<String, Object> response = new HashMap<>();
        response.put("doctorId", doctor.getId());
        response.put("doctorName", doctor.getName());
        response.put("specialty", doctor.getSpecialty());
        response.put("date", date);
        response.put("allSlots", allSlots);
        response.put("bookedSlots", bookedSlots);
        response.put("availableSlots", availableSlots);

        return ResponseEntity.ok(response);
    }
}
