import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-booking-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './booking-modal.html'
})
export class BookingModal {
  @Input() room: any;
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

    const activeUser = JSON.parse(localStorage.getItem('active_user') || '{}');
    let allBookings = JSON.parse(localStorage.getItem('inwlab_bookings') || '[]');

    // 时间防撞车检测 (Collision Detection)
    const roomBookingsToday = allBookings.filter((b: any) => b.roomId === this.room.id && b.date === this.bookingData.date);
    const newStart = this.bookingData.startTime;
    const newEnd = this.bookingData.endTime;

    const hasOverlap = roomBookingsToday.some((b: any) => {
      return (newStart < b.endTime && newEnd > b.startTime);
    });

    if (hasOverlap) {
      alert("🚨 Time slot conflict! This room is already booked during your requested time. Please check the Schedule or choose another time.");
      return;
    }

    // 存入历史记录
    const newBooking = {
      roomId: this.room.id,
      roomName: this.room.name,
      userEmail: activeUser.email,
      userName: activeUser.fullName,
      ...this.bookingData,
      timestamp: new Date().toISOString()
    };
    allBookings.push(newBooking);
    localStorage.setItem('inwlab_bookings', JSON.stringify(allBookings));

    // 🌟 更新主页面的房间状态
    let rooms = JSON.parse(localStorage.getItem('inwlab_rooms') || '[]');
    const roomIndex = rooms.findIndex((r: any) => r.id === this.room.id);

    if (roomIndex !== -1) {
      if (this.bookingData.pax) rooms[roomIndex].capacity = this.bookingData.pax;
      if (this.bookingData.equipment) {
        rooms[roomIndex].equipment = this.bookingData.equipment.split(',').map((e:string) => e.trim());
      }
      rooms[roomIndex].cleanedTime = `Scheduled after ${this.bookingData.endTime}`;

      // 🌟 绝对正确的判定：满3次变 Fully Booked，否则依然是 Available
      if (roomBookingsToday.length + 1 >= 3) {
        rooms[roomIndex].status = 'Fully Booked';
      } else {
        rooms[roomIndex].status = 'Available';
      }

      localStorage.setItem('inwlab_rooms', JSON.stringify(rooms));
    }

    alert(`Success! ${this.room.name} has been booked. You can view it in My Booking History.`);
    this.bookingSaved.emit();
  }
}
