import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // 🌟 已更新为本地 cPanel Node.js 路径
  private apiUrl = 'https://internetworks.my/api/users';

  constructor(private http: HttpClient) {}

  register(userData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, userData);
  }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials);
  }

  verifySecurityQuestions(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/verify-security`, data, { responseType: 'text' });
  }

  resetPassword(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/reset-password`, data, { responseType: 'text' });
  }

  getAllUsers(): Observable<any> {
    return this.http.get(`${this.apiUrl}/all`);
  }
}
