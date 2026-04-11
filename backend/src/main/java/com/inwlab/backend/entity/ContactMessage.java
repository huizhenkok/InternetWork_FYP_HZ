package com.inwlab.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "contact_messages")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ContactMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String department;

    @Column(nullable = false, length = 1000) // 留言可能比较长，设置长度为 1000
    private String message;

    @Column(nullable = false)
    private String status = "Unread"; // 默认状态是未读

    @Column(nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now(); // 自动记录留言时间
}