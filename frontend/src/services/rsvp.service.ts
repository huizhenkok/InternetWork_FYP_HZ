import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class RsvpService {
  // 🌟 已更新为本地 cPanel Node.js 路径
  private apiUrl = 'https://internetworks.my/api/rsvps';

  constructor(private http: HttpClient) {}

  submitRsvp(rsvpData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/submit`, rsvpData);
  }

  getAllRsvps(): Observable<any> {
    return this.http.get(`${this.apiUrl}/all`);
  }

  approveRsvp(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/approve`, {});
  }

  rejectRsvp(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/reject`, {});
  }
}
