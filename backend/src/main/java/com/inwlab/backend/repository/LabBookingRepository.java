package com.inwlab.backend.repository;

import com.inwlab.backend.entity.LabBooking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LabBookingRepository extends JpaRepository<LabBooking, Long> {

    // 按照创建时间倒序排列所有预约
    List<LabBooking> findAllByOrderByCreatedAtDesc();
}