package com.inwlab.backend.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "cms_data")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CmsData {

    @Id // 这里我们不用自增数字作为主键，而是用页面的名字（比如 "page_news"）作为主键
    @Column(name = "page_key", nullable = false, unique = true)
    private String pageKey;

    @Lob // Lob 代表大文本，告诉 MySQL 这个字段用来存很长很长的 JSON 字符串
    @Column(name = "content_json", columnDefinition = "LONGTEXT", nullable = false)
    private String contentJson;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt = LocalDateTime.now();
}