package com.inwlab.backend.controller;

import com.inwlab.backend.entity.EventRsvp;
import com.inwlab.backend.repository.EventRsvpRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/rsvps")
@CrossOrigin(origins = "http://localhost:4200") // Crucial for Angular connection
public class EventRsvpController {

    @Autowired
    private EventRsvpRepository rsvpRepository;

    // 1. Public API: Submit a new RSVP
    @PostMapping("/submit")
    public ResponseEntity<?> submitRsvp(@RequestBody EventRsvp rsvp) {
        rsvp.setCreatedAt(LocalDateTime.now());
        rsvp.setStatus("Pending");
        EventRsvp savedRsvp = rsvpRepository.save(rsvp);
        return ResponseEntity.ok(savedRsvp);
    }

    // 2. Admin API: Get all RSVPs
    @GetMapping("/all")
    public ResponseEntity<List<EventRsvp>> getAllRsvps() {
        List<EventRsvp> rsvps = rsvpRepository.findAllByOrderByCreatedAtDesc();
        return ResponseEntity.ok(rsvps);
    }

    // 3. Admin API: Approve RSVP
    @PutMapping("/{id}/approve")
    public ResponseEntity<?> approveRsvp(@PathVariable Long id) {
        return rsvpRepository.findById(id).map(rsvp -> {
            rsvp.setStatus("Approved");
            rsvpRepository.save(rsvp);
            return ResponseEntity.ok(rsvp);
        }).orElse(ResponseEntity.notFound().build());
    }

    // 4. Admin API: Reject RSVP
    @PutMapping("/{id}/reject")
    public ResponseEntity<?> rejectRsvp(@PathVariable Long id) {
        return rsvpRepository.findById(id).map(rsvp -> {
            rsvp.setStatus("Rejected");
            rsvpRepository.save(rsvp);
            return ResponseEntity.ok(rsvp);
        }).orElse(ResponseEntity.notFound().build());
    }
}