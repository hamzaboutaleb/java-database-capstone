package com.project.back_end.service;

import com.project.back_end.dto.LoginDTO;
import com.project.back_end.models.Doctor;
import com.project.back_end.repository.DoctorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class DoctorService {

    @Autowired
    private DoctorRepository doctorRepository;

    @Autowired
    private TokenService tokenService;

    public String login(LoginDTO loginDTO) {
        Optional<Doctor> doctor = doctorRepository.findByEmailAndPassword(
                loginDTO.getEmail(), loginDTO.getPassword());

        if (doctor.isEmpty()) {
            return null;
        }

        return tokenService.generateToken(
                doctor.get().getEmail(), "doctor", doctor.get().getId());
    }

    public List<Doctor> getAllDoctors() {
        return doctorRepository.findAll();
    }

    public Optional<Doctor> getDoctorById(Long id) {
        return doctorRepository.findById(id);
    }

    public List<Doctor> searchByName(String name) {
        return doctorRepository.findByNameContainingIgnoreCase(name);
    }

    public List<Doctor> filterBySpecialty(String specialty) {
        return doctorRepository.findBySpecialty(specialty);
    }

    public Doctor createDoctor(Doctor doctor) {
        if (doctorRepository.findByEmail(doctor.getEmail()).isPresent()) {
            throw new IllegalArgumentException("A doctor with this email already exists");
        }
        return doctorRepository.save(doctor);
    }

    public Doctor updateDoctor(Long id, Doctor updatedDoctor) {
        Doctor existing = doctorRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Doctor not found with id: " + id));

        existing.setName(updatedDoctor.getName());
        existing.setSpecialty(updatedDoctor.getSpecialty());
        existing.setEmail(updatedDoctor.getEmail());
        existing.setPhone(updatedDoctor.getPhone());
        if (updatedDoctor.getPassword() != null) {
            existing.setPassword(updatedDoctor.getPassword());
        }
        if (updatedDoctor.getAvailableTimes() != null) {
            existing.setAvailableTimes(updatedDoctor.getAvailableTimes());
        }
        return doctorRepository.save(existing);
    }

    public void deleteDoctor(Long id) {
        if (!doctorRepository.existsById(id)) {
            throw new IllegalArgumentException("Doctor not found with id: " + id);
        }
        doctorRepository.deleteById(id);
    }
}
