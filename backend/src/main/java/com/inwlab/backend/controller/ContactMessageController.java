package com.inwlab.backend.controller;

import com.inwlab.backend.entity.ContactMessage;
import com.inwlab.backend.repository.ContactMessageRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/contact")
@CrossOrigin(origins = "http://localhost:4200")
public class ContactMessageController {

    @Autowired
    private ContactMessageRepository messageRepository;

    // 1. 前端用户提交留言
    @PostMapping("/submit")
    public ResponseEntity<?> submitMessage(@RequestBody ContactMessage message) {
        message.setCreatedAt(LocalDateTime.now());
        message.setStatus("Unread");
        ContactMessage savedMessage = messageRepository.save(message);
        return ResponseEntity.ok(savedMessage);
    }

    // 2. Admin 后台获取所有留言
    @GetMapping("/all")
    public ResponseEntity<List<ContactMessage>> getAllMessages() {
        List<ContactMessage> messages = messageRepository.findAllByOrderByCreatedAtDesc();
        return ResponseEntity.ok(messages);
    }

    // 🌟 新增：3. Admin 标记留言为已读
    @PutMapping("/{id}/read")
    public ResponseEntity<?> markAsRead(@PathVariable Long id) {
        return messageRepository.findById(id).map(message -> {
            message.setStatus("Read");
            messageRepository.save(message);
            return ResponseEntity.ok(message);
        }).orElse(ResponseEntity.notFound().build());
    }

    // 🌟 新增：4. Admin 删除留言
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteMessage(@PathVariable Long id) {
        messageRepository.deleteById(id);
        return ResponseEntity.ok().build();
    }
}