package com.inwlab.backend.controller;

import com.inwlab.backend.entity.LabBooking;
import com.inwlab.backend.repository.LabBookingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "http://localhost:4200")
public class LabBookingController {

    @Autowired
    private LabBookingRepository bookingRepository;

    // 1. 前端用户提交预约请求
    @PostMapping("/submit")
    public ResponseEntity<?> submitBooking(@RequestBody LabBooking booking) {
        booking.setCreatedAt(LocalDateTime.now());
        booking.setStatus("Pending"); // 新预约默认都是待审批
        LabBooking savedBooking = bookingRepository.save(booking);
        return ResponseEntity.ok(savedBooking);
    }

    // 2. Admin 后台获取所有预约
    @GetMapping("/all")
    public ResponseEntity<List<LabBooking>> getAllBookings() {
        List<LabBooking> bookings = bookingRepository.findAllByOrderByCreatedAtDesc();
        return ResponseEntity.ok(bookings);
    }

    // 3. Admin 批准预约
    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approveBooking(@PathVariable Long id) {
        return bookingRepository.findById(id).map(booking -> {
            booking.setStatus("Approved");
            bookingRepository.save(booking);
            return ResponseEntity.ok(booking);
        }).orElse(ResponseEntity.notFound().build());
    }

    // 4. Admin 拒绝预约
    @PutMapping("/{id}/reject")
    public ResponseEntity<?> rejectBooking(@PathVariable Long id) {
        return bookingRepository.findById(id).map(booking -> {
            booking.setStatus("Rejected");
            bookingRepository.save(booking);
            return ResponseEntity.ok(booking);
        }).orElse(ResponseEntity.notFound().build());
    }
}