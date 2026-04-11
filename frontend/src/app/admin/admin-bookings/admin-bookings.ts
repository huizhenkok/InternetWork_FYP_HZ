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
  searchQuery: string = '';

  // 🌟 核心：控制当前显示哪个管理模块
  activeTab: 'bookings' | 'rsvps' | 'messages' = 'bookings';

  // --- 1. Lab Bookings 数据 ---
  allBookings: any[] = [];
  filteredBookings: any[] = [];
  pendingCount: number = 0;
  conflictCount: number = 0;

  // --- 2. Event RSVPs 数据 ---
  allRsvps: any[] = [];
  filteredRsvps: any[] = [];
  pendingRsvpCount: number = 0;

  // --- 3. Contact Messages 数据 ---
  allMessages: any[] = [];
  filteredMessages: any[] = [];
  unreadMessageCount: number = 0;

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

      // 1. 加载 Lab Bookings
      const storedBookings = JSON.parse(localStorage.getItem('inwlab_bookings') || '[]');
      this.allBookings = storedBookings.map((b: any) => {
        let rawStatus = b.status || 'Pending';
        let normalizedStatus = rawStatus.charAt(0).toUpperCase() + rawStatus.slice(1).toLowerCase();
        return {
          ...b,
          status: normalizedStatus,
          safeName: b.userName || b.name || 'Unknown User',
          safeRoom: b.roomName || b.room || b.title || 'Unspecified Asset',
          safeDate: b.dateStr || b.date || 'No Date',
          safeId: b.id ? b.id.toString() : Math.floor(Math.random() * 900000).toString()
        };
      }).sort((a: any, b: any) => new Date(b.timestamp || 0).getTime() - new Date(a.timestamp || 0).getTime());

      // 2. 加载 Event RSVPs
      this.allRsvps = JSON.parse(localStorage.getItem('inwlab_event_rsvps') || '[]');

      // 3. 加载 Contact Messages
      this.allMessages = JSON.parse(localStorage.getItem('inwlab_contact_messages') || '[]');

      this.filterData();
      this.calculateStats();
    }
  }

  // 🌟 统一的搜索过滤逻辑
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

  // 🌟 统一的角标统计逻辑
  calculateStats() {
    this.pendingCount = this.allBookings.filter(b => b.status === 'Pending').length;
    this.pendingRsvpCount = this.allRsvps.filter(r => r.status === 'Pending').length;
    this.unreadMessageCount = this.allMessages.filter(m => m.status === 'Unread').length;

    // 计算冲突
    const roomDates = this.allBookings.map(b => b.safeRoom + '_' + b.safeDate.split(' ')[0]);
    const uniqueRoomDates = new Set(roomDates);
    this.conflictCount = roomDates.length - uniqueRoomDates.size;
  }

  // ================= LAB BOOKINGS ACTIONS =================
  approveBooking(booking: any) {
    if (isPlatformBrowser(this.platformId) && confirm(`APPROVE booking for ${booking.safeName}?`)) {
      booking.status = 'Approved';
      this.saveBookingsToDB();
    }
  }

  rejectBooking(booking: any) {
    if (isPlatformBrowser(this.platformId) && confirm(`REJECT booking for ${booking.safeName}?`)) {
      booking.status = 'Rejected';
      this.saveBookingsToDB();
    }
  }

  saveBookingsToDB() {
    this.allBookings.forEach(b => {
      const filteredMatch = this.filteredBookings.find(fb => fb.safeId === b.safeId);
      if (filteredMatch) b.status = filteredMatch.status;
    });
    localStorage.setItem('inwlab_bookings', JSON.stringify(this.allBookings));
    this.calculateStats(); this.filterData();
  }

  // ================= EVENT RSVPS ACTIONS =================
  approveRsvp(rsvp: any) {
    if (isPlatformBrowser(this.platformId) && confirm(`APPROVE RSVP for ${rsvp.name}?`)) {
      rsvp.status = 'Approved';
      this.saveRsvpsToDB();
    }
  }

  rejectRsvp(rsvp: any) {
    if (isPlatformBrowser(this.platformId) && confirm(`REJECT RSVP for ${rsvp.name}?`)) {
      rsvp.status = 'Rejected';
      this.saveRsvpsToDB();
    }
  }

  saveRsvpsToDB() {
    localStorage.setItem('inwlab_event_rsvps', JSON.stringify(this.allRsvps));
    this.calculateStats(); this.filterData();
  }

  // ================= CONTACT MESSAGES ACTIONS =================
  markMessageAsRead(msg: any) {
    msg.status = 'Read';
    localStorage.setItem('inwlab_contact_messages', JSON.stringify(this.allMessages));
    this.calculateStats(); this.filterData();
  }

  deleteMessage(index: number) {
    if (confirm("Permanently delete this message?")) {
      // 从 filtered 找到对应的 index，并在 allMessages 里删除
      const msgToDelete = this.filteredMessages[index];
      this.allMessages = this.allMessages.filter(m => m.id !== msgToDelete.id);
      localStorage.setItem('inwlab_contact_messages', JSON.stringify(this.allMessages));
      this.calculateStats(); this.filterData();
    }
  }

  // ================= UTILS =================
  exportLog() {
    if (!isPlatformBrowser(this.platformId)) return;

    let targetArray = [];
    let headers = [];
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
    this.searchQuery = ''; // 切换 Tab 时清空搜索
    this.filterData();
  }
}
