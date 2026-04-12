package com.inwlab.backend.controller;

import com.inwlab.backend.entity.User;
import com.inwlab.backend.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import org.mindrot.jbcrypt.BCrypt; // 🌟 BCrypt Import
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:4200") // Allow Angular frontend CORS requests
public class UserController {

    @Autowired
    private UserRepository userRepository;

    // ==========================================
    // 🌟 System Initialization: Auto-create Admin
    // Runs automatically every time Spring Boot starts
    // ==========================================
    @PostConstruct
    public void initAdmin() {
        String adminEmail = "IOT_admin123@gmail.com";
        String adminRawPassword = "Enjoyurday_123";

        // Check if the admin account already exists
        if (!userRepository.existsByEmail(adminEmail)) {
            User admin = new User();
            admin.setEmail(adminEmail);
            // Hash the password before saving to DB!
            admin.setPassword(BCrypt.hashpw(adminRawPassword, BCrypt.gensalt()));
            admin.setFullName("System Admin");
            admin.setRole("Admin");

            userRepository.save(admin);
            System.out.println("✅ Security Alert: Default Admin account initialized successfully.");
        }
    }

    // ==========================================
    // 1. Registration API (POST: /api/users/register)
    // ==========================================
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        // Check if email is already registered
        if (userRepository.existsByEmail(user.getEmail())) {
            return ResponseEntity.badRequest().body("Error: Email is already in use!");
        }

        // 🌟 Security Upgrade: Hash the user's password using BCrypt
        String hashedPassword = BCrypt.hashpw(user.getPassword(), BCrypt.gensalt());
        user.setPassword(hashedPassword);

        User savedUser = userRepository.save(user);
        return ResponseEntity.ok(savedUser);
    }

    // ==========================================
    // 2. Login API (POST: /api/users/login)
    // ==========================================
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User loginRequest) {
        // Find user by email in the database
        Optional<User> userOptional = userRepository.findByEmail(loginRequest.getEmail());

        if (userOptional.isPresent()) {
            User dbUser = userOptional.get();

            // 🌟 Security Upgrade: Compare raw login password against stored BCrypt hash
            if (BCrypt.checkpw(loginRequest.getPassword(), dbUser.getPassword())) {
                return ResponseEntity.ok(dbUser); // Login successful, return user info
            }
        }

        // Incorrect password or email not found
        return ResponseEntity.status(401).body("Error: Invalid email or password");
    }
}