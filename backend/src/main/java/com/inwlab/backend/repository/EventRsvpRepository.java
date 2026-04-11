package com.inwlab.backend.repository;

import com.inwlab.backend.entity.EventRsvp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EventRsvpRepository extends JpaRepository<EventRsvp, Long> {

    // Automatically generates SQL to find all RSVPs sorted by newest first
    List<EventRsvp> findAllByOrderByCreatedAtDesc();
}