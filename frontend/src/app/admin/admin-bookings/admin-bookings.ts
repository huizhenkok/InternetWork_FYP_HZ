import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID, NgZone } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ContactService } from '../../../services/contact.service';
import { RsvpService } from '../../../services/rsvp.service';
import { BookingService } from '../../../services/booking.service';

declare var AOS: any;

@Component({
  selector: 'app-admin-bookings',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './admin-bookings.html'
})
export class AdminBookings implements OnInit, OnDestroy {

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

  private pollingTimer: any;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private ngZone: NgZone,
    private router: Router,
    private contactService: ContactService,
    private rsvpService: RsvpService,
    private bookingService: BookingService
  ) {}

  ngOnInit() {
    this.loadData();
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        if (typeof AOS !== 'undefined') { AOS.init({ duration: 800, once: true, offset: 50 }); AOS.refreshHard(); }
      }, 100);

      this.ngZone.runOutsideAngular(() => {
        this.pollingTimer = setInterval(() => {
          this.ngZone.run(() => { this.loadData(true); });
        }, 10000);
      });
    }
  }

  ngOnDestroy() {
    if (this.pollingTimer) {
      clearInterval(this.pollingTimer);
    }
  }

  loadData(isSilent: boolean = false) {
    if (isPlatformBrowser(this.platformId)) {
      const activeUser = JSON.parse(localStorage.getItem('active_user') || '{}');
      if (activeUser.fullName) this.adminName = activeUser.fullName;

      // 1. 加载 Lab Bookings
      this.bookingService.getAllBookings().subscribe({
        next: (data: any) => {
          // 🌟 核心时间解析逻辑：自动兼容不同格式的提交
          this.allBookings = data.map((b: any) => {
            let start = '00:00';
            let end = '00:00';

            // 情况1：如果提交的是分开的时间字段
            if (b.startTime && b.endTime) {
              start = b.startTime;
              end = b.endTime;
            }
            // 情况2：如果提交的是合并的时间段，例如 "10:00-11:30"
            else if (b.timeSlot && b.timeSlot.includes('-')) {
              const timeParts = b.timeSlot.split('-');
              start = timeParts[0].trim();
              end = timeParts[1].trim();
            }
            // 情况3：如果直接是个单一字符串
            else if (b.timeSlot) {
              start = b.timeSlot;
              end = '';
            }

            return {
              ...b,
              safeName: b.userName || b.userEmail || 'Unknown User',
              safeRoom: b.roomName || b.purpose || 'General Lab Request',
              safeDate: b.bookingDate || b.date || b.createdAt || 'N/A',
              startTime: start,
              endTime: end,
              safeId: b.id ? b.id.toString() : '0'
            };
          });
          this.filterData();
          this.calculateStats();
        }
      });

      // 2. 加载 Event RSVPs
      this.rsvpService.getAllRsvps().subscribe({
        next: (data: any) => {
          this.allRsvps = data;
          this.filterData();
          this.calculateStats();
        }
      });

      // 3. 加载 Contact Messages
      this.contactService.getAllMessages().subscribe({
        next: (data: any) => {
          this.allMessages = data;
          this.filterData();
          this.calculateStats();
        }
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
        r.name.toLowerCase().includes(query) || r.eventName.toLowerCase().includes(query) || (r.role && r.role.toLowerCase().includes(query))
      );
    } else if (this.activeTab === 'messages') {
      this.filteredMessages = this.allMessages.filter(m =>
        m.name.toLowerCase().includes(query) || m.email.toLowerCase().includes(query) || (m.department && m.department.toLowerCase().includes(query))
      );
    }
  }

  calculateStats() {
    this.pendingCount = this.allBookings.filter(b => b.status === 'Pending').length;
    this.pendingRsvpCount = this.allRsvps.filter(r => r.status === 'Pending').length;
    this.unreadMessageCount = this.allMessages.filter(m => m.status === 'Unread').length;

    const roomDates = this.allBookings.map(b => b.safeRoom + '_' + b.safeDate);
    const uniqueRoomDates = new Set(roomDates);
    this.conflictCount = roomDates.length - uniqueRoomDates.size;
  }

  approveBooking(booking: any) {
    if (isPlatformBrowser(this.platformId) && confirm(`APPROVE booking for ${booking.safeName}?`)) {
      this.bookingService.approveBooking(booking.id).subscribe({
        next: () => { booking.status = 'Approved'; this.calculateStats(); },
      });
    }
  }

  rejectBooking(booking: any) {
    if (isPlatformBrowser(this.platformId) && confirm(`REJECT booking for ${booking.safeName}?`)) {
      this.bookingService.rejectBooking(booking.id).subscribe({
        next: () => { booking.status = 'Rejected'; this.calculateStats(); },
      });
    }
  }

  approveRsvp(rsvp: any) {
    if (isPlatformBrowser(this.platformId) && confirm(`APPROVE RSVP for ${rsvp.name}?`)) {
      this.rsvpService.approveRsvp(rsvp.id).subscribe({
        next: () => { rsvp.status = 'Approved'; this.calculateStats(); },
      });
    }
  }

  rejectRsvp(rsvp: any) {
    if (isPlatformBrowser(this.platformId) && confirm(`REJECT RSVP for ${rsvp.name}?`)) {
      this.rsvpService.rejectRsvp(rsvp.id).subscribe({
        next: () => { rsvp.status = 'Rejected'; this.calculateStats(); },
      });
    }
  }

  markMessageAsRead(msg: any) {
    this.contactService.markAsRead(msg.id).subscribe({
      next: () => { msg.status = 'Read'; this.calculateStats(); },
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
      });
    }
  }

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
        const safeDateString = typeof item.safeDate === 'string' ? item.safeDate.split('T')[0] : 'N/A';
        return [item.safeId, item.safeName, item.safeRoom, safeDateString, item.startTime || 'N/A', item.endTime || 'N/A', item.status].map(val => `"${val}"`).join(',');
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
