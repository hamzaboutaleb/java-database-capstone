package com.project.back_end.service;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.SignatureAlgorithm;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.security.Key;
import java.util.Date;

@Service
public class TokenService {

    @Value("${jwt.secret}")
    private String secret;

    private static final long EXPIRATION_MS = 24 * 60 * 60 * 1000; // 24 hours

    // --- Signing Key ---

    public Key getSigningKey() {
        byte[] keyBytes = secret.getBytes();
        return Keys.hmacShaKeyFor(keyBytes);
    }

    // --- Generate JWT Token ---

    public String generateToken(String email, String role) {
        Date now = new Date();
        Date expiration = new Date(now.getTime() + EXPIRATION_MS);

        return Jwts.builder()
                .setSubject(email)
                .claim("role", role)
                .setIssuedAt(now)
                .setExpiration(expiration)
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    public String generateToken(String email, String role, Long userId) {
        Date now = new Date();
        Date expiration = new Date(now.getTime() + EXPIRATION_MS);

        return Jwts.builder()
                .setSubject(email)
                .claim("role", role)
                .claim("userId", userId)
                .setIssuedAt(now)
                .setExpiration(expiration)
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
    }

    // --- Validate Token ---

    public boolean isValidToken(String token) {
        try {
            getClaims(token);
            return true;
        } catch (Exception e) {
            return false;
        }
    }

    public boolean validateTokenForRole(String token, String expectedRole) {
        try {
            Claims claims = getClaims(token);
            String role = claims.get("role", String.class);
            return expectedRole.equals(role);
        } catch (Exception e) {
            return false;
        }
    }

    // --- Extract Claims ---

    private Claims getClaims(String token) {
        return Jwts.parserBuilder()
                .setSigningKey(getSigningKey())
                .build()
                .parseClaimsJws(token)
                .getBody();
    }

    public String getRole(String token) {
        try {
            Claims claims = getClaims(token);
            return claims.get("role", String.class);
        } catch (Exception e) {
            return null;
        }
    }

    public String getEmail(String token) {
        try {
            Claims claims = getClaims(token);
            return claims.getSubject();
        } catch (Exception e) {
            return null;
        }
    }

    public Long getDoctorId(String token) {
        try {
            Claims claims = getClaims(token);
            return claims.get("userId", Long.class);
        } catch (Exception e) {
            return null;
        }
    }

    public Long getPatientId(String token) {
        try {
            Claims claims = getClaims(token);
            return claims.get("userId", Long.class);
        } catch (Exception e) {
            return null;
        }
    }

    // kept for compatibility with TokenService interface used by other services
    public void storeToken(String token, String role) {
        // No-op: JWT is stateless, claims are embedded in the token
    }

    public void storeToken(String token, String role, Long doctorId) {
        // No-op: JWT is stateless, claims are embedded in the token
    }

    public void storePatientToken(String token, Long patientId) {
        // No-op: JWT is stateless, claims are embedded in the token
    }

    public void removeToken(String token) {
        // No-op: JWT is stateless
    }
}
