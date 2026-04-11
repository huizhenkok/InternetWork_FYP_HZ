package com.inwlab.backend.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@RestController
@RequestMapping("/api/upload")
@CrossOrigin(origins = "http://localhost:4200")
public class FileUploadController {

    // 🌟 图片将会保存在你后端项目根目录下的 uploads 文件夹里
    private static final String UPLOAD_DIR = System.getProperty("user.dir") + "/uploads/";

    @PostMapping("/image")
    public ResponseEntity<?> uploadImage(@RequestParam("file") MultipartFile file) {
        try {
            // 1. 如果 uploads 文件夹不存在，系统会自动帮你创建一个
            File directory = new File(UPLOAD_DIR);
            if (!directory.exists()) {
                directory.mkdirs();
            }

            // 2. 给文件生成一个全球唯一的乱码名字（UUID），防止不同人上传同名文件被覆盖
            String originalFilename = file.getOriginalFilename();
            String extension = originalFilename.substring(originalFilename.lastIndexOf("."));
            String uniqueFilename = UUID.randomUUID().toString() + extension;

            // 3. 把文件真正保存到硬盘上
            Path filePath = Paths.get(UPLOAD_DIR + uniqueFilename);
            Files.write(filePath, file.getBytes());

            // 4. 返回这个图片的访问 URL 给前端 (如果你后端不是 8080 端口，记得改一下这里)
            String fileUrl = "http://localhost:8080/uploads/" + uniqueFilename;

            // 返回 JSON 格式给 Angular 前端
            return ResponseEntity.ok("{\"url\":\"" + fileUrl + "\"}");

        } catch (IOException e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("{\"error\":\"Failed to upload image\"}");
        }
    }
}