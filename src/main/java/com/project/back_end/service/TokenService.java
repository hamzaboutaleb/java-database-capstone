package com.project.back_end.service;

import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class TokenService {

    // In-memory token store: token -> role ("admin" or "doctor")
    // In production, replace with JWT parsing or a persistent store
    private final Map<String, String> tokenStore = new ConcurrentHashMap<>();

    // Store mapping of token -> doctor ID for doctor tokens
    private final Map<String, Long> doctorTokenStore = new ConcurrentHashMap<>();

    public void storeToken(String token, String role) {
        tokenStore.put(token, role);
    }

    public void storeToken(String token, String role, Long doctorId) {
        tokenStore.put(token, role);
        if (doctorId != null) {
            doctorTokenStore.put(token, doctorId);
        }
    }

    public boolean isValidToken(String token) {
        return token != null && tokenStore.containsKey(token);
    }

    public boolean validateTokenForRole(String token, String expectedRole) {
        if (token == null || !tokenStore.containsKey(token)) {
            return false;
        }
        return expectedRole.equals(tokenStore.get(token));
    }

    public String getRole(String token) {
        return tokenStore.get(token);
    }

    public Long getDoctorId(String token) {
        return doctorTokenStore.get(token);
    }

    public void removeToken(String token) {
        tokenStore.remove(token);
        doctorTokenStore.remove(token);
    }
}
