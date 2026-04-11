import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BookingService {
  // 🌟 指向 Spring Boot 写的 Bookings API
  private apiUrl = 'http://localhost:8080/api/bookings';

  constructor(private http: HttpClient) {}

  // 1. 发送预约请求
  submitBooking(bookingData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/submit`, bookingData);
  }

  // 2. Admin 获取所有预约
  getAllBookings(): Observable<any> {
    return this.http.get(`${this.apiUrl}/all`);
  }

  // 3. Admin 批准预约
  approveBooking(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/approve`, {});
  }

  // 4. Admin 拒绝预约
  rejectBooking(id: number): Observable<any> {
    return this.http.put(`${this.apiUrl}/${id}/reject`, {});
  }
}
