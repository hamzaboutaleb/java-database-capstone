package com.project.back_end.repository;

import com.project.back_end.models.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {

    Optional<Patient> findByEmail(String email);

    Optional<Patient> findByPhone(String phone);

    Optional<Patient> findByEmailOrPhone(String email, String phone);

    Optional<Patient> findByEmailAndPassword(String email, String password);
}
