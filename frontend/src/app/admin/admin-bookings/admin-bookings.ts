import { Component, OnInit, Inject, PLATFORM_ID, NgZone } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

declare var AOS: any;

@Component({
  selector: 'app-admin-bookings',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './admin-bookings.html'
})
export class AdminBookings implements OnInit {

  adminName: string = 'System Admin';
  allBookings: any[] = [];
  filteredBookings: any[] = [];
  searchQuery: string = '';

  pendingCount: number = 0;
  conflictCount: number = 0;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private ngZone: NgZone,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadData();
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        if (typeof AOS !== 'undefined') {
          AOS.init({ duration: 800, once: true, offset: 50 });
          AOS.refreshHard();
        }
      }, 100);
    }
  }

  loadData() {
    if (isPlatformBrowser(this.platformId)) {
      const activeUser = JSON.parse(localStorage.getItem('active_user') || '{}');
      if (activeUser.fullName) this.adminName = activeUser.fullName;

      const storedBookings = JSON.parse(localStorage.getItem('inwlab_bookings') || '[]');

      this.allBookings = storedBookings.map((b: any) => {
        // 🌟 核心修复：强制规范化 status 字段，解决大小写和空值问题
        let rawStatus = b.status || 'Pending';
        let normalizedStatus = rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1).toLowerCase();

        return {
          ...b,
          status: normalizedStatus, // 确保首字母大写，如 'Pending', 'Approved'
          safeName: b.userName || b.name || 'Unknown User',
          safeRoom: b.roomName || b.room || b.title || 'Unspecified Asset',
          safeDate: b.dateStr || b.date || 'No Date',
          safeId: b.id ? b.id.toString() : Math.floor(Math.random() * 900000).toString()
        };
      }).sort((a: any, b: any) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime());

      this.filteredBookings = [...this.allBookings];
      this.calculateStats();
    }
  }

  filterBookings() {
    const query = this.searchQuery.toLowerCase().trim();
    if (!query) {
      this.filteredBookings = [...this.allBookings];
      return;
    }

    this.filteredBookings = this.allBookings.filter(b =>
      b.safeName.toLowerCase().includes(query) ||
      b.safeRoom.toLowerCase().includes(query) ||
      b.safeId.toLowerCase().includes(query) ||
      b.status.toLowerCase().includes(query)
    );
  }

  calculateStats() {
    this.pendingCount = this.allBookings.filter(b => b.status === 'Pending').length;

    const roomDates = this.allBookings.map(b => b.safeRoom + '_' + b.safeDate.split(' ')[0]);
    const uniqueRoomDates = new Set(roomDates);
    this.conflictCount = roomDates.length - uniqueRoomDates.size;
  }

  approveBooking(booking: any) {
    if (isPlatformBrowser(this.platformId)) {
      if(confirm(`Are you sure you want to APPROVE the booking for ${booking.safeName}?`)) {
        booking.status = 'Approved';
        this.saveBookingsToDB();
      }
    }
  }

  rejectBooking(booking: any) {
    if (isPlatformBrowser(this.platformId)) {
      if(confirm(`Are you sure you want to REJECT the booking for ${booking.safeName}?`)) {
        booking.status = 'Rejected';
        this.saveBookingsToDB();
      }
    }
  }

  saveBookingsToDB() {
    // 找到在 allBookings 里对应的数据并更新
    this.allBookings.forEach(b => {
      const filteredMatch = this.filteredBookings.find(fb => fb.safeId === b.safeId);
      if (filteredMatch) {
        b.status = filteredMatch.status;
      }
    });

    localStorage.setItem('inwlab_bookings', JSON.stringify(this.allBookings));
    this.calculateStats();
    this.filterBookings();
  }

  exportLog() {
    if (!isPlatformBrowser(this.platformId)) return;

    if (this.filteredBookings.length === 0) {
      alert("No data to export!");
      return;
    }

    const headers = ['Booking ID', 'User Name', 'Asset/Location', 'Date', 'Start Time', 'End Time', 'Status'];
    const csvRows = this.filteredBookings.map(b => [
      b.safeId,
      b.safeName,
      b.safeRoom,
      b.safeDate.split(' ')[0],
      b.startTime || 'N/A',
      b.endTime || 'N/A',
      b.status
    ].map(val => `"${val}"`).join(','));

    const csvContent = [headers.join(','), ...csvRows].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `INWLab_Booking_Logs_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  logout() {
    if (confirm("Are you sure you want to logout?")) {
      localStorage.removeItem('active_user');
      this.router.navigate(['/login']);
    }
  }
}
