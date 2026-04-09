package com.project.back_end.repository;

import com.project.back_end.models.Doctor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DoctorRepository extends JpaRepository<Doctor, Long> {

    Optional<Doctor> findByEmail(String email);

    Optional<Doctor> findByEmailAndPassword(String email, String password);

    List<Doctor> findByNameContainingIgnoreCase(String name);

    List<Doctor> findBySpecialty(String specialty);
}
