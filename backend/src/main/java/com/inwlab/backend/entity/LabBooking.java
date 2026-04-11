package com.inwlab.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "lab_bookings")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LabBooking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_name", nullable = false)
    private String userName;

    @Column(name = "user_email", nullable = false)
    private String userEmail;

    @Column(name = "room_name", nullable = false)
    private String roomName; // 预约的实验室或设备名称

    @Column(name = "booking_date", nullable = false)
    private String bookingDate; // 预约日期 (例如: 2026-11-04)

    @Column(name = "start_time", nullable = false)
    private String startTime; // 开始时间 (例如: 09:00 AM)

    @Column(name = "end_time", nullable = false)
    private String endTime; // 结束时间 (例如: 11:00 AM)

    @Column(length = 500)
    private String purpose; // 预约目的

    @Column(nullable = false)
    private String status = "Pending"; // 状态：Pending, Approved, Rejected

    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}