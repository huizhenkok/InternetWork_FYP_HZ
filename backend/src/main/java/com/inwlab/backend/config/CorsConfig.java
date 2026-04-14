package com.inwlab.backend.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class CorsConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/**") // 允许所有 API 接口被访问
                .allowedOrigins(
                        "https://internetworks.my", // 🌟 允许你的 cPanel 生产环境域名
                        "http://localhost:4200"     // 允许本地 Angular 测试环境
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS") // 允许的方法
                .allowedHeaders("*") // 允许所有的请求头
                .allowCredentials(true); // 允许携带 Cookie 或安全验证信息
    }
}