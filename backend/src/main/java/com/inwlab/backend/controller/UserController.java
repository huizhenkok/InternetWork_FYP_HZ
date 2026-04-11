package com.inwlab.backend.controller;

import com.inwlab.backend.entity.User;
import com.inwlab.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Optional;

@RestController
@RequestMapping("/api/users")
@CrossOrigin(origins = "http://localhost:4200") // 🌟 极其重要：允许 Angular 前端跨域请求！
public class UserController {

    @Autowired
    private UserRepository userRepository;

    // ==========================================
    // 1. 注册 API (Register)
    // 前端发送 POST 请求到 http://localhost:8080/api/users/register
    // ==========================================
    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        // 检查邮箱是否已经被注册
        if (userRepository.existsByEmail(user.getEmail())) {
            return ResponseEntity.badRequest().body("Error: Email is already in use!");
        }

        // 🚨 V1 版本：为了方便我们测试，密码直接明文保存。
        // 在真实的生产环境中，这里必须使用 BCrypt 加密密码！
        User savedUser = userRepository.save(user);
        return ResponseEntity.ok(savedUser);
    }

    // ==========================================
    // 2. 登录 API (Login)
    // 前端发送 POST 请求到 http://localhost:8080/api/users/login
    // ==========================================
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody User loginRequest) {
        // 去数据库里找这个邮箱对应的用户
        Optional<User> userOptional = userRepository.findByEmail(loginRequest.getEmail());

        if (userOptional.isPresent()) {
            User user = userOptional.get();
            // 比对密码 (第一版我们用明文比对)
            if (user.getPassword().equals(loginRequest.getPassword())) {
                return ResponseEntity.ok(user); // 登录成功！把用户信息(包含角色)返回给前端
            }
        }

        // 密码不对或者邮箱不存在，返回 401 未授权错误
        return ResponseEntity.status(401).body("Error: Invalid email or password");
    }
}