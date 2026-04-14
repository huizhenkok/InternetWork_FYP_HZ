package com.inwlab.backend.controller;

import org.springframework.http.*;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;
import java.util.Base64;
import java.util.Map;

@RestController
@RequestMapping("/api/upload")
public class FileUploadController {

    // 🌟 把这里替换成你刚刚在 ImgBB 申请到的 API Key
    private static final String IMGBB_API_KEY = "b66e46fac2b95879c73aa40b58458dc2";

    @PostMapping("/image")
    public ResponseEntity<?> uploadImage(@RequestParam("file") MultipartFile file) {
        try {
            // 1. 将图片转换为 Base64 编码（方便在网络上传输）
            String base64Image = Base64.getEncoder().encodeToString(file.getBytes());

            // 2. 准备发送给 ImgBB 云端图床
            RestTemplate restTemplate = new RestTemplate();
            String url = "https://api.imgbb.com/1/upload?key=" + IMGBB_API_KEY;

            MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
            body.add("image", base64Image);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
            HttpEntity<MultiValueMap<String, String>> requestEntity = new HttpEntity<>(body, headers);

            // 3. 呼叫云端 API 并获取永久链接
            ResponseEntity<Map> response = restTemplate.postForEntity(url, requestEntity, Map.class);

            if (response.getStatusCode() == HttpStatus.OK && response.getBody() != null) {
                Map<String, Object> data = (Map<String, Object>) response.getBody().get("data");
                String imageUrl = (String) data.get("url"); // 获取 ImgBB 提供的永久链接

                // 将永久链接返回给你的 Angular 前端
                return ResponseEntity.ok("{\"url\":\"" + imageUrl + "\"}");
            } else {
                return ResponseEntity.status(500).body("{\"error\":\"Failed to upload to cloud\"}");
            }

        } catch (Exception e) {
            e.printStackTrace();
            return ResponseEntity.status(500).body("{\"error\":\"File processing error\"}");
        }
    }
}