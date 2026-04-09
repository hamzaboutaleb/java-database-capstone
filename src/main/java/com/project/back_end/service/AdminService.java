package com.project.back_end.service;

import com.project.back_end.dto.LoginDTO;
import com.project.back_end.models.Admin;
import com.project.back_end.repository.AdminRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class AdminService {

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private TokenService tokenService;

    public String login(LoginDTO loginDTO) {
        Optional<Admin> admin = adminRepository.findByUsernameAndPassword(
                loginDTO.getUsername(), loginDTO.getPassword());

        if (admin.isEmpty()) {
            return null;
        }

        return tokenService.generateToken(admin.get().getUsername(), "admin");
    }

    public Optional<Admin> findByUsername(String username) {
        return adminRepository.findByUsername(username);
    }
}
