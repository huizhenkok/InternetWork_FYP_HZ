import { Component, OnInit, Inject, PLATFORM_ID, NgZone } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BookingService } from '../../../services/booking.service';
import { CmsService } from '../../../services/cms.service';
import { AuthService } from '../../../services/auth.service'; // 🌟 引入 AuthService 用来获取真实用户数

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

  isDarkMode: boolean = false; // 🌟 记录当前主题状态

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private ngZone: NgZone,
    private router: Router,
    private bookingService: BookingService,
    private cmsService: CmsService,
    private authService: AuthService // 🌟 注入
  ) {}

  ngOnInit() {
    this.checkTheme();
    this.loadSystemData();
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        if (typeof AOS !== 'undefined') { AOS.init({ duration: 800, once: true, offset: 50 }); AOS.refreshHard(); }
      }, 100);
    }
  }

  // 🌟 Req 3: 检查系统当前是否是暗黑模式
  checkTheme() {
    if (isPlatformBrowser(this.platformId)) {
      this.isDarkMode = document.documentElement.classList.contains('dark');
    }
  }

  // 🌟 Req 3: 切换暗黑模式
  toggleTheme() {
    if (isPlatformBrowser(this.platformId)) {
      const root = document.documentElement;
      if (root.classList.contains('dark')) {
        root.classList.remove('dark');
        this.isDarkMode = false;
      } else {
        root.classList.add('dark');
        this.isDarkMode = true;
      }
    }
  }

  loadSystemData() {
    if (isPlatformBrowser(this.platformId)) {
      const activeUser = JSON.parse(localStorage.getItem('active_user') || '{}');
      if (activeUser.fullName) { this.adminName = activeUser.fullName; }

      // 🌟 Req 1: 彻底抛弃 LocalStorage，从真实数据库获取所有用户
      this.authService.getAllUsers().subscribe({
        next: (users: any[]) => {
          this.totalUsers = users.length;
        },
        error: (err) => console.error("Failed to load real users", err)
      });

      this.cmsService.getCmsData('inwlab_forum_topics').subscribe({
        next: (res: any) => {
          try { this.totalTopics = JSON.parse(res.contentJson).length; } catch(e) {}
        }
      });

      this.bookingService.getAllBookings().subscribe({
        next: (bookings: any[]) => {
          this.activeBookings = bookings.length;
          this.pendingBookings = bookings.filter((b: any) => b.status === 'Pending').sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          this.pendingCount = this.pendingBookings.length;

          const recentBookings = [...bookings].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);

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
    this.systemLogs = [{ time: new Date().toLocaleString(), eventId: '#SYS-0001', status: 'SYSTEM', user: 'Root Admin', action: 'Command Center Initialized', avatar: 'https://via.placeholder.com/150' }];
    this.filteredLogs = [...this.systemLogs];
  }

  toggleNotifications() { this.showNotifications = !this.showNotifications; }

  filterLogs() {
    const query = this.searchQuery.toLowerCase().trim();
    if (!query) { this.filteredLogs = [...this.systemLogs]; return; }
    this.filteredLogs = this.systemLogs.filter(log => log.user.toLowerCase().includes(query) || log.action.toLowerCase().includes(query) || log.eventId.toLowerCase().includes(query) || log.status.toLowerCase().includes(query));
  }

  logout() {
    if (confirm("Are you sure you want to logout from the Admin Console?")) {
      localStorage.removeItem('active_user');
      this.router.navigate(['/login']);
    }
  }
}
