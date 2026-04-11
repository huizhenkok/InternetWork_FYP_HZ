package com.inwlab.backend.repository;

import com.inwlab.backend.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    // Spring Data JPA 的黑魔法：你只要按照它的命名规则写方法名，它会自动生成 SQL 语句！
    // 比如这个方法会自动生成：SELECT * FROM users WHERE email = ?
    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);
}