package com.inwlab.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

@Entity // Marks this class as a JPA Entity
@Table(name = "users") // Specifies the table name in DB to avoid SQL keyword conflicts
@Data // Lombok: Generates getters, setters, toString, etc.
@NoArgsConstructor // Lombok: Generates an empty constructor
@AllArgsConstructor // Lombok: Generates an all-arguments constructor
public class User {

    @Id // Marks this field as the Primary Key
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Auto-increment ID
    private Long id;

    @Column(nullable = false, unique = true) // Email cannot be null and must be unique
    private String email;

    @Column(nullable = false)
    private String password; // Will now store BCrypt hashed strings

    @Column(name = "full_name", nullable = false)
    private String fullName;

    @Column(nullable = false)
    private String role; // e.g., 'Student', 'Faculty', 'Alumni', 'Admin'

}