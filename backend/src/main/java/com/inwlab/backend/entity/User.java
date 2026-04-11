package com.inwlab.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity // 告诉 JPA 这是一个实体类
@Table(name = "users") // 指定在数据库中生成的表名，避免和 SQL 关键字 user 冲突
@Data // Lombok 注解：自动生成 getter, setter, toString 等方法
@NoArgsConstructor // Lombok 注解：自动生成无参构造函数
@AllArgsConstructor // Lombok 注解：自动生成全参构造函数
public class User {

    @Id // 告诉 JPA 这是主键 (Primary Key)
    @GeneratedValue(strategy = GenerationType.IDENTITY) // 设置主键自动递增 (Auto Increment)
    private Long id;

    @Column(nullable = false, unique = true) // 邮箱不能为空且必须唯一
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(nullable = false)
    private String role; // 例如：'Student', 'Faculty', 'Alumni', 'Admin'

    // 你可以根据前端需要，后续再添加其他字段，比如 avatar, phone 等
}