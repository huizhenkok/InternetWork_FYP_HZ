import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ContactService {
  // 🌟 已更新为本地 cPanel Node.js 路径
  private apiUrl = 'https://internetworks.my/api/contact';

  constructor(private http: HttpClient) {}

  submitMessage(messageData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/submit`, messageData);
  }

  getAllMessages(): Observable<any> {
    return this.http.get(`${this.apiUrl}/all`);
  }

  markAsRead(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/read`, {});
  }

  deleteMessage(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}
