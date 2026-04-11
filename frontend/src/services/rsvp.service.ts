import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RsvpService {
  // 🌟 指向我们刚刚在 Spring Boot 写的 RSVP API
  private apiUrl = 'http://localhost:8080/api/rsvps';

  constructor(private http: HttpClient) {}

  // 1. 发送报名请求给后端
  submitRsvp(rsvpData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/submit`, rsvpData);
  }

  // 2. Admin 获取所有报名记录
  getAllRsvps(): Observable<any> {
    return this.http.get(`${this.apiUrl}/all`);
  }

  // 3. Admin 批准报名
  approveRsvp(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/approve`, {});
  }

  // 4. Admin 拒绝报名
  rejectRsvp(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/reject`, {});
  }
}
