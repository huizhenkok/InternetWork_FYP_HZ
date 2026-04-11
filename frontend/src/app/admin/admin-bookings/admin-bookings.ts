import { Component, OnInit, Inject, PLATFORM_ID, NgZone } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ContactService } from '../../../services/contact.service';
import { RsvpService } from '../../../services/rsvp.service';
import { BookingService } from '../../../services/booking.service'; // 🌟 引入真实的 BookingService

declare var AOS: any;

@Component({
  selector: 'app-admin-bookings',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './admin-bookings.html'
})
export class AdminBookings implements OnInit {

  adminName: string = 'System Admin';
  searchQuery: string = '';
  activeTab: 'bookings' | 'rsvps' | 'messages' = 'bookings';

  allBookings: any[] = [];
  filteredBookings: any[] = [];
  pendingCount: number = 0;
  conflictCount: number = 0;

  allRsvps: any[] = [];
  filteredRsvps: any[] = [];
  pendingRsvpCount: number = 0;

  allMessages: any[] = [];
  filteredMessages: any[] = [];
  unreadMessageCount: number = 0;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private ngZone: NgZone,
    private router: Router,
    private contactService: ContactService,
    private rsvpService: RsvpService,
    private bookingService: BookingService // 🌟 注入 BookingService
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

      // 🌟 1. 加载 Lab Bookings (从 MySQL 获取！)
      this.bookingService.getAllBookings().subscribe({
        next: (data: any) => {
          // 为了适配你原本的 HTML 模板变量名，这里做一下映射
          this.allBookings = data.map((b: any) => ({
            ...b,
            safeName: b.userName,
            safeRoom: b.roomName,
            safeDate: b.bookingDate,
            safeId: b.id.toString()
          }));
          this.filterData();
          this.calculateStats();
        },
        error: (err: any) => console.error("Failed to fetch bookings", err)
      });

      // 2. 加载 Event RSVPs (从 MySQL 获取)
      this.rsvpService.getAllRsvps().subscribe({
        next: (data: any) => {
          this.allRsvps = data;
          this.filterData();
          this.calculateStats();
        },
        error: (err: any) => console.error("Failed to fetch RSVPs", err)
      });

      // 3. 加载 Contact Messages (从 MySQL 获取)
      this.contactService.getAllMessages().subscribe({
        next: (data: any) => {
          this.allMessages = data;
          this.filterData();
          this.calculateStats();
        },
        error: (err: any) => console.error("Failed to fetch messages", err)
      });
    }
  }

  filterData() {
    const query = this.searchQuery.toLowerCase().trim();

    if (!query) {
      this.filteredBookings = [...this.allBookings];
      this.filteredRsvps = [...this.allRsvps];
      this.filteredMessages = [...this.allMessages];
      return;
    }

    if (this.activeTab === 'bookings') {
      this.filteredBookings = this.allBookings.filter(b =>
        b.safeName.toLowerCase().includes(query) || b.safeRoom.toLowerCase().includes(query) || b.safeId.toLowerCase().includes(query) || b.status.toLowerCase().includes(query)
      );
    } else if (this.activeTab === 'rsvps') {
      this.filteredRsvps = this.allRsvps.filter(r =>
        r.name.toLowerCase().includes(query) || r.eventName.toLowerCase().includes(query) || r.role.toLowerCase().includes(query)
      );
    } else if (this.activeTab === 'messages') {
      this.filteredMessages = this.allMessages.filter(m =>
        m.name.toLowerCase().includes(query) || m.email.toLowerCase().includes(query) || m.department.toLowerCase().includes(query)
      );
    }
  }

  calculateStats() {
    this.pendingCount = this.allBookings.filter(b => b.status === 'Pending').length;
    this.pendingRsvpCount = this.allRsvps.filter(r => r.status === 'Pending').length;
    this.unreadMessageCount = this.allMessages.filter(m => m.status === 'Unread').length;

    const roomDates = this.allBookings.map(b => b.safeRoom + '_' + b.safeDate.split(' ')[0]);
    const uniqueRoomDates = new Set(roomDates);
    this.conflictCount = roomDates.length - uniqueRoomDates.size;
  }

  // ================= LAB BOOKINGS ACTIONS =================

  approveBooking(booking: any) {
    if (isPlatformBrowser(this.platformId) && confirm(`APPROVE booking for ${booking.safeName}?`)) {
      // 🌟 调用真实 API：批准
      this.bookingService.approveBooking(booking.id).subscribe({
        next: () => {
          booking.status = 'Approved';
          this.calculateStats();
        },
        error: (err: any) => console.error("Error approving booking", err)
      });
    }
  }

  rejectBooking(booking: any) {
    if (isPlatformBrowser(this.platformId) && confirm(`REJECT booking for ${booking.safeName}?`)) {
      // 🌟 调用真实 API：拒绝
      this.bookingService.rejectBooking(booking.id).subscribe({
        next: () => {
          booking.status = 'Rejected';
          this.calculateStats();
        },
        error: (err: any) => console.error("Error rejecting booking", err)
      });
    }
  }

  // ================= EVENT RSVPS ACTIONS =================
  approveRsvp(rsvp: any) {
    if (isPlatformBrowser(this.platformId) && confirm(`APPROVE RSVP for ${rsvp.name}?`)) {
      this.rsvpService.approveRsvp(rsvp.id).subscribe({
        next: () => { rsvp.status = 'Approved'; this.calculateStats(); },
        error: (err: any) => console.error("Error approving RSVP", err)
      });
    }
  }

  rejectRsvp(rsvp: any) {
    if (isPlatformBrowser(this.platformId) && confirm(`REJECT RSVP for ${rsvp.name}?`)) {
      this.rsvpService.rejectRsvp(rsvp.id).subscribe({
        next: () => { rsvp.status = 'Rejected'; this.calculateStats(); },
        error: (err: any) => console.error("Error rejecting RSVP", err)
      });
    }
  }

  // ================= CONTACT MESSAGES ACTIONS =================
  markMessageAsRead(msg: any) {
    this.contactService.markAsRead(msg.id).subscribe({
      next: () => { msg.status = 'Read'; this.calculateStats(); },
      error: (err: any) => console.error("Error marking message as read", err)
    });
  }

  deleteMessage(index: number) {
    if (confirm("Permanently delete this message?")) {
      const msgToDelete = this.filteredMessages[index];
      this.contactService.deleteMessage(msgToDelete.id).subscribe({
        next: () => {
          this.allMessages = this.allMessages.filter(m => m.id !== msgToDelete.id);
          this.filterData(); this.calculateStats();
        },
        error: (err: any) => console.error("Error deleting message", err)
      });
    }
  }

  // ================= UTILS =================
  exportLog() {
    if (!isPlatformBrowser(this.platformId)) return;

    let targetArray = [];
    let headers: string[] = [];
    let filename = '';

    if (this.activeTab === 'bookings') {
      targetArray = this.filteredBookings;
      headers = ['Booking ID', 'User Name', 'Asset/Location', 'Date', 'Start Time', 'End Time', 'Status'];
      filename = 'Booking_Logs';
    } else if (this.activeTab === 'rsvps') {
      targetArray = this.filteredRsvps;
      headers = ['RSVP ID', 'Event Name', 'Participant Name', 'Role', 'Email', 'Status'];
      filename = 'RSVP_Logs';
    } else {
      alert("Export is only available for Bookings and RSVPs.");
      return;
    }

    if (targetArray.length === 0) { alert("No data to export!"); return; }

    const csvRows = targetArray.map(item => {
      if (this.activeTab === 'bookings') {
        return [item.safeId, item.safeName, item.safeRoom, item.safeDate.split(' ')[0], item.startTime || 'N/A', item.endTime || 'N/A', item.status].map(val => `"${val}"`).join(',');
      } else {
        return [item.id, item.eventName, item.name, item.role, item.email, item.status].map(val => `"${val}"`).join(',');
      }
    });

    const csvContent = [headers.join(','), ...csvRows].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `INWLab_${filename}_${new Date().toLocaleDateString()}.csv`);
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
  }

  logout() {
    if (confirm("Are you sure you want to logout?")) {
      localStorage.removeItem('active_user');
      this.router.navigate(['/login']);
    }
  }

  setTab(tab: 'bookings' | 'rsvps' | 'messages') {
    this.activeTab = tab;
    this.searchQuery = '';
    this.filterData();
  }
}
