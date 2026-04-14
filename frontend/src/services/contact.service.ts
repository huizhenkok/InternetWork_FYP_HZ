import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  // 🌟 已更新为云端 API
  private apiUrl = 'https://internetwork-fyp-hz.onrender.com/api/contact';

  constructor(private http: HttpClient) {}

  submitMessage(messageData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/submit`, messageData);
  }

  getAllMessages(): Observable<any> {
    return this.http.get(`${this.apiUrl}/all`);
  }

  // 🌟 新增：发送请求标记为已读
  markAsRead(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/read`, {});
  }

  // 🌟 新增：发送请求删除留言
  deleteMessage(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
