import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  // 🌟 已更新为本地 cPanel Node.js 路径
  private apiUrl = 'https://internetworks.my/api/bookings';

  constructor(private http: HttpClient) {}

  submitBooking(bookingData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/submit`, bookingData);
  }

  getAllBookings(): Observable<any> {
    return this.http.get(`${this.apiUrl}/all`);
  }

  approveBooking(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/approve`, {});
  }

  rejectBooking(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/reject`, {});
  }
}
