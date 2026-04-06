import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
// 🌟 像引进零件一样，把 Modal 引进主页面
import { BookingModal } from './booking-modal/booking-modal';

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, BookingModal], // 🌟 放到 imports 里
  templateUrl: './booking.html'
})
export class Booking {
  isModalOpen = false; // 控制弹窗开或者关的开关
}
