package com.inwlab.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "event_rsvps")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class EventRsvp {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String email;

    @Column(name = "event_name", nullable = false)
    private String eventName;

    @Column(nullable = false)
    private String role; // e.g., 'Student', 'Faculty', 'Alumni'

    @Column(length = 500)
    private String message; // Optional message from the participant

    @Column(nullable = false)
    private String status = "Pending"; // Default status is Pending (Pending, Approved, Rejected)

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}