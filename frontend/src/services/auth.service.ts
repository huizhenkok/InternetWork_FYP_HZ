import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root' // 表明这是一个全局服务
})
export class AuthService {
  // 🌟 这里指向我们刚刚在 Spring Boot 写的 API 地址
  private apiUrl = 'http://localhost:8080/api/users';

  constructor(private http: HttpClient) {}

  // 1. 发送注册请求到后端
  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  // 2. 发送登录请求到后端
  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials);
  }
}
