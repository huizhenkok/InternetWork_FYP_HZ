package com.inwlab.backend.repository;

import com.inwlab.backend.entity.ContactMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContactMessageRepository extends JpaRepository<ContactMessage, Long> {

    // Spring Boot 自动帮你写好 SQL：查找所有留言，并按照时间倒序排列（最新的在最上面）
    List<ContactMessage> findAllByOrderByCreatedAtDesc();
}