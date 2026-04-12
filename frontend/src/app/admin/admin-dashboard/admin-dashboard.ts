import { Component, OnInit, Inject, PLATFORM_ID, NgZone } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BookingService } from '../../../services/booking.service'; // 🌟 Added
import { CmsService } from '../../../services/cms.service'; // 🌟 Added

declare var AOS: any;

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './admin-dashboard.html'
})
export class AdminDashboard implements OnInit {

  totalUsers: number = 0;
  activeBookings: number = 0;
  totalTopics: number = 0;

  systemLogs: any[] = [];
  filteredLogs: any[] = [];
  searchQuery: string = '';

  adminName: string = 'System Admin';

  showNotifications: boolean = false;
  pendingBookings: any[] = [];
  pendingCount: number = 0;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private ngZone: NgZone,
    private router: Router,
    private bookingService: BookingService, // 🌟 Inject
    private cmsService: CmsService // 🌟 Inject
  ) {}

  ngOnInit() {
    this.loadSystemData();
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        if (typeof AOS !== 'undefined') {
          AOS.init({ duration: 800, once: true, offset: 50 });
          AOS.refreshHard();
        }
      }, 100);
    }
  }

  loadSystemData() {
    if (isPlatformBrowser(this.platformId)) {
      const activeUser = JSON.parse(localStorage.getItem('active_user') || '{}');
      if (activeUser.fullName) {
        this.adminName = activeUser.fullName;
      }

      // 1. Get Users (Temporarily from LocalStorage until backend API is built)
      const users = JSON.parse(localStorage.getItem('inwlab_users') || '[]');
      this.totalUsers = users.length;

      // 2. Get Topics from MySQL CMS
      this.cmsService.getCmsData('inwlab_forum_topics').subscribe({
        next: (res: any) => {
          try {
            const topics = JSON.parse(res.contentJson);
            this.totalTopics = topics.length;
          } catch(e) {}
        }
      });

      // 3. Get Real Bookings from MySQL Booking API
      this.bookingService.getAllBookings().subscribe({
        next: (bookings: any[]) => {
          this.activeBookings = bookings.length;

          // Calculate pending notifications
          this.pendingBookings = bookings.filter((b: any) => b.status === 'Pending')
            .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          this.pendingCount = this.pendingBookings.length;

          // Generate System Logs from recent bookings
          const recentBookings = [...bookings]
            .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
            .slice(0, 5);

          this.systemLogs = recentBookings.map((b: any) => ({
            time: new Date(b.createdAt).toLocaleString(),
            eventId: '#BKG-' + b.id,
            status: b.status.toUpperCase(),
            user: b.userName || 'Unknown User',
            action: `Requested ${b.roomName}`,
            avatar: `http://googleusercontent.com/profile/picture/${Math.floor(Math.random() * 10)}`
          }));

          if (this.systemLogs.length === 0) this.addDefaultLog();
          this.filteredLogs = [...this.systemLogs];
        },
        error: () => this.addDefaultLog()
      });
    }
  }

  addDefaultLog() {
    this.systemLogs = [{
      time: new Date().toLocaleString(),
      eventId: '#SYS-0001',
      status: 'SYSTEM',
      user: 'Root Admin',
      action: 'Command Center Initialized',
      avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBu-QHK2bRGqtLLmojWpxlA6gWMXlDzIcGkgEZkxZ4tRoME2ax9-qlQu3G6ETm_secv4WpStFn5C7HmrVlUVDsQEGpSHQMYU_jCV_5uonKERqKBehLM1NkoerJ1gsUFKXUJ-WdpCpWo2ubaE9hkvrQOyFcU9m7FqTdmEeiMZX9k8LHhMRFG7Y4nuVl3Ldt0enjI-swgoEcJ9RL1ZdFmzaK6YD9WKT30WuE-D98ZA1vZAdQwkasDN5FxUs-TrsppYRzONIcd6_pqvwbc'
    }];
    this.filteredLogs = [...this.systemLogs];
  }

  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
  }

  filterLogs() {
    const query = this.searchQuery.toLowerCase().trim();
    if (!query) {
      this.filteredLogs = [...this.systemLogs];
      return;
    }

    this.filteredLogs = this.systemLogs.filter(log =>
      log.user.toLowerCase().includes(query) ||
      log.action.toLowerCase().includes(query) ||
      log.eventId.toLowerCase().includes(query) ||
      log.status.toLowerCase().includes(query)
    );
  }

  logout() {
    if (confirm("Are you sure you want to logout from the Admin Console?")) {
      localStorage.removeItem('active_user');
      this.router.navigate(['/login']);
    }
  }
}
