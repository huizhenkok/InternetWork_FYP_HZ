package com.inwlab.backend.controller;

import com.inwlab.backend.entity.CmsData;
import com.inwlab.backend.repository.CmsDataRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Optional;

@RestController
@RequestMapping("/api/cms")
@CrossOrigin(origins = "http://localhost:4200")
public class CmsController {

    @Autowired
    private CmsDataRepository cmsRepository;

    // 1. 获取某个页面的 CMS 数据 (前台网页渲染时调用)
    @GetMapping("/{pageKey}")
    public ResponseEntity<?> getCmsData(@PathVariable String pageKey) {
        Optional<CmsData> data = cmsRepository.findById(pageKey);
        if (data.isPresent()) {
            return ResponseEntity.ok(data.get());
        } else {
            // 如果数据库里还没存过这个页面的数据，返回 404。前端接收到 404 后就会显示默认的硬编码数据。
            return ResponseEntity.notFound().build();
        }
    }

    // 2. Admin 后台保存/更新页面的 CMS 数据
    @PostMapping("/{pageKey}")
    public ResponseEntity<?> saveCmsData(@PathVariable String pageKey, @RequestBody String jsonContent) {
        // 去数据库找，找到了就更新它，没找到就新建一个
        CmsData cmsData = cmsRepository.findById(pageKey).orElse(new CmsData());

        cmsData.setPageKey(pageKey);
        cmsData.setContentJson(jsonContent);
        cmsData.setUpdatedAt(LocalDateTime.now());

        CmsData savedData = cmsRepository.save(cmsData);
        return ResponseEntity.ok(savedData);
    }
}