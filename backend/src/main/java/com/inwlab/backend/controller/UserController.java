package com.inwlab.backend.controller;

import com.inwlab.backend.entity.User;
import com.inwlab.backend.repository.UserRepository;
import jakarta.annotation.PostConstruct;
import org.mindrot.jbcrypt.BCrypt; // 🌟 BCrypt Import
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
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

            // 🌟 给 Admin 也加上默认的安全答案，防止未来 Admin 需要重置密码
            admin.setMatricNumber("ADMIN-001");
            admin.setSecAnsColor("black");
            admin.setSecAnsState("kedah");
            admin.setSecAnsFruit("apple");

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

        // 🌟 核心防呆设计：把传进来的答案全部变成小写并去掉空格，
        // 这样用户在重置密码时，无论打大写还是小写，只要字母对就能通过。
        if (user.getSecAnsColor() != null) user.setSecAnsColor(user.getSecAnsColor().toLowerCase().trim());
        if (user.getSecAnsState() != null) user.setSecAnsState(user.getSecAnsState().toLowerCase().trim());
        if (user.getSecAnsFruit() != null) user.setSecAnsFruit(user.getSecAnsFruit().toLowerCase().trim());

        // Security Upgrade: Hash the user's password using BCrypt
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

            // Security Upgrade: Compare raw login password against stored BCrypt hash
            if (BCrypt.checkpw(loginRequest.getPassword(), dbUser.getPassword())) {
                return ResponseEntity.ok(dbUser); // Login successful, return user info
            }
        }

        // Incorrect password or email not found
        return ResponseEntity.status(401).body("Error: Invalid email or password");
    }

    // ==========================================
    // 🌟 3. Verify Security Answers API (POST: /api/users/verify-security)
    // ==========================================
    @PostMapping("/verify-security")
    public ResponseEntity<?> verifySecurityQuestions(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        // 把传过来的答案也全部转成小写，和数据库里的进行完美匹配
        String ansColor = payload.get("ansColor") != null ? payload.get("ansColor").toLowerCase().trim() : "";
        String ansState = payload.get("ansState") != null ? payload.get("ansState").toLowerCase().trim() : "";
        String ansFruit = payload.get("ansFruit") != null ? payload.get("ansFruit").toLowerCase().trim() : "";

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (!userOpt.isPresent()) {
            return ResponseEntity.status(404).body("Error: No account found with this email address.");
        }

        User user = userOpt.get();

        // 严格比对三个答案
        boolean isColorMatch = user.getSecAnsColor() != null && user.getSecAnsColor().equals(ansColor);
        boolean isStateMatch = user.getSecAnsState() != null && user.getSecAnsState().equals(ansState);
        boolean isFruitMatch = user.getSecAnsFruit() != null && user.getSecAnsFruit().equals(ansFruit);

        if (isColorMatch && isStateMatch && isFruitMatch) {
            return ResponseEntity.ok("Verification Successful");
        } else {
            return ResponseEntity.status(403).body("Error: Security answers are incorrect.");
        }
    }

    // ==========================================
    // 🌟 4. Reset Password API (POST: /api/users/reset-password)
    // ==========================================
    @PostMapping("/reset-password")
    public ResponseEntity<?> resetPassword(@RequestBody Map<String, String> payload) {
        String email = payload.get("email");
        String newPassword = payload.get("newPassword");

        Optional<User> userOpt = userRepository.findByEmail(email);
        if (!userOpt.isPresent()) {
            return ResponseEntity.status(404).body("Error: User not found.");
        }

        User user = userOpt.get();
        // 将新密码用 BCrypt 加密后覆盖旧密码
        user.setPassword(BCrypt.hashpw(newPassword, BCrypt.gensalt()));
        userRepository.save(user);

        return ResponseEntity.ok("Password has been successfully reset!");
    }

    // ==========================================
    // 🌟 5. Get All Users API (GET: /api/users/all)
    // 用于 Admin 控制台读取所有注册用户
    // ==========================================
    @GetMapping("/all")
    public ResponseEntity<?> getAllUsers() {
        return ResponseEntity.ok(userRepository.findAll());
    }
}