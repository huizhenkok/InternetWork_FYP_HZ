import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookingService } from '../../../../services/booking.service'; // 🌟 引入刚写的 Service

@Component({
  selector: 'app-booking-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './booking-modal.html'
})
export class BookingModal {
  @Input() room: any;
  @Input() allSystemBookings: any[] = []; // 🌟 新增：接收从父组件传来的所有预约记录用于防撞车检测
  @Output() close = new EventEmitter<void>();
  @Output() bookingSaved = new EventEmitter<void>();

  bookingData = {
    date: '',
    startTime: '',
    endTime: '',
    purpose: '',
    pax: '',
    equipment: ''
  };

  isSubmitting: boolean = false; // 添加一个提交状态防抖

  constructor(private bookingService: BookingService) {} // 🌟 注入 Service

  closeModal() {
    this.close.emit();
  }

  saveBooking() {
    if (!this.bookingData.date || !this.bookingData.startTime || !this.bookingData.endTime || !this.bookingData.purpose) {
      alert("Please fill in all required fields.");
      return;
    }

    if (this.bookingData.startTime >= this.bookingData.endTime) {
      alert("End time must be after Start time!");
      return;
    }

    // 🌟 时间防撞车检测 (Collision Detection)
    // 注意：现在用的是从 MySQL 拉取的全量预约数据 allSystemBookings
    // 并且我们只防撞那些状态为 'Approved' 或 'Pending' 的预约 (被 'Rejected' 的不算撞车)
    const roomBookingsToday = this.allSystemBookings.filter((b: any) =>
      b.roomName === this.room.name &&
      b.bookingDate === this.bookingData.date &&
      (b.status === 'Approved' || b.status === 'Pending')
    );

    const newStart = this.bookingData.startTime;
    const newEnd = this.bookingData.endTime;

    const hasOverlap = roomBookingsToday.some((b: any) => {
      return (newStart < b.endTime && newEnd > b.startTime);
    });

    if (hasOverlap) {
      alert("🚨 Time slot conflict! This room is already booked or pending approval during your requested time. Please check the Schedule or choose another time.");
      return;
    }

    this.isSubmitting = true;

    // 获取当前登录用户
    const activeUser = JSON.parse(localStorage.getItem('active_user') || '{}');

    // 🌟 组合发送给 Spring Boot 后端的数据
    const payload = {
      userName: activeUser.fullName || 'Unknown User',
      userEmail: activeUser.email || 'unknown@domain.com',
      roomName: this.room.name,
      bookingDate: this.bookingData.date,
      startTime: this.bookingData.startTime,
      endTime: this.bookingData.endTime,
      purpose: this.bookingData.purpose
    };

    // 🌟 调用 BookingService 发送真实 HTTP POST 请求
    this.bookingService.submitBooking(payload).subscribe({
      next: (response: any) => {
        this.isSubmitting = false;

        // （暂留逻辑）更新主页面的房间状态
        let rooms = JSON.parse(localStorage.getItem('inwlab_rooms') || '[]');
        const roomIndex = rooms.findIndex((r: any) => r.id === this.room.id);
        if (roomIndex !== -1) {
          if (this.bookingData.pax) rooms[roomIndex].capacity = this.bookingData.pax;
          if (this.bookingData.equipment) {
            rooms[roomIndex].equipment = this.bookingData.equipment.split(',').map((e:string) => e.trim());
          }
          rooms[roomIndex].cleanedTime = `Scheduled after ${this.bookingData.endTime}`;
          if (roomBookingsToday.length + 1 >= 3) {
            rooms[roomIndex].status = 'Fully Booked';
          } else {
            rooms[roomIndex].status = 'Available';
          }
          localStorage.setItem('inwlab_rooms', JSON.stringify(rooms));
        }

        alert(`Success! ${this.room.name} booking request submitted. Waiting for Admin approval.`);
        this.bookingSaved.emit();
      },
      error: (err: any) => {
        this.isSubmitting = false;
        console.error("Booking Error:", err);
        alert("Failed to submit booking. Please try again.");
      }
    });
  }
}
