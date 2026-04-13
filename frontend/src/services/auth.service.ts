import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = 'http://localhost:8080/api/users';

  constructor(private http: HttpClient) {}

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials);
  }

  // 🌟 验证安全问题答案 (必须加 responseType: 'text')
  verifySecurityQuestions(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/verify-security`, data, { responseType: 'text' });
  }

  // 🌟 重置密码 (必须加 responseType: 'text')
  resetPassword(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, data, { responseType: 'text' });
  }

  // 🌟 获取所有用户 (供 Admin Dashboard 和 User Management 使用)
  getAllUsers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/all`);
  }
}
