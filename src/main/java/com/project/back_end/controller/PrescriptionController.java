package com.project.back_end.controller;

import com.project.back_end.models.Prescription;
import com.project.back_end.service.PrescriptionService;
import com.project.back_end.service.TokenService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/prescriptions")
public class PrescriptionController {

    @Autowired
    private PrescriptionService prescriptionService;

    @Autowired
    private TokenService tokenService;

    // --- Helper ---

    private ResponseEntity<Map<String, String>> unauthorized() {
        Map<String, String> error = new HashMap<>();
        error.put("message", "Invalid or missing token");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }

    @GetMapping("/{token}")
    public ResponseEntity<?> getPrescriptions(
            @PathVariable String token,
            @RequestParam(required = false) String patientName,
            @RequestParam(required = false) Long appointmentId) {

        if (!tokenService.isValidToken(token)) {
            return unauthorized();
        }

        if (patientName != null && !patientName.isEmpty()) {
            return ResponseEntity.ok(prescriptionService.getPrescriptionsByPatientName(patientName));
        }
        if (appointmentId != null) {
            return ResponseEntity.ok(prescriptionService.getPrescriptionsByAppointmentId(appointmentId));
        }
        return ResponseEntity.ok(prescriptionService.getAllPrescriptions());
    }

    @GetMapping("/{token}/{id}")
    public ResponseEntity<?> getPrescriptionById(@PathVariable String token, @PathVariable String id) {
        if (!tokenService.isValidToken(token)) {
            return unauthorized();
        }

        Optional<Prescription> prescription = prescriptionService.getPrescriptionById(id);
        return prescription.map(p -> ResponseEntity.ok((Object) p))
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/{token}")
    public ResponseEntity<Map<String, String>> createPrescription(
            @PathVariable String token,
            @Valid @RequestBody Prescription prescription) {

        if (!tokenService.validateTokenForRole(token, "doctor")) {
            return unauthorized();
        }

        try {
            prescriptionService.createPrescription(prescription);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Prescription created successfully");
            return ResponseEntity.status(HttpStatus.CREATED).body(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to create prescription: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }

    @DeleteMapping("/{token}/{id}")
    public ResponseEntity<Map<String, String>> deletePrescription(
            @PathVariable String token,
            @PathVariable String id) {

        if (!tokenService.validateTokenForRole(token, "doctor")) {
            return unauthorized();
        }

        try {
            prescriptionService.deletePrescription(id);
            Map<String, String> response = new HashMap<>();
            response.put("message", "Prescription deleted successfully");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, String> error = new HashMap<>();
            error.put("message", "Failed to delete prescription: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(error);
        }
    }
}
