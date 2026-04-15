import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID, NgZone } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { BookingService } from '../../../services/booking.service';
import { CmsService } from '../../../services/cms.service';
import { AuthService } from '../../../services/auth.service';
import { ContactService } from '../../../services/contact.service'; // 🌟 新增
import { RsvpService } from '../../../services/rsvp.service'; // 🌟 新增

declare var AOS: any;

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './admin-dashboard.html'
})
export class AdminDashboard implements OnInit, OnDestroy {

  totalUsers: number = 0;
  activeBookings: number = 0;
  totalTopics: number = 0;

  systemLogs: any[] = [];
  filteredLogs: any[] = [];
  searchQuery: string = '';

  adminName: string = 'System Admin';

  showNotifications: boolean = false;

  // 🌟 铃铛需要的变量
  pendingBookings: any[] = [];
  pendingCount: number = 0;
  pendingRsvpCount: number = 0;
  unreadMessageCount: number = 0;

  private pollingTimer: any; // 🌟 轮询计时器

  isDarkMode: boolean = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private ngZone: NgZone,
    private router: Router,
    private bookingService: BookingService,
    private cmsService: CmsService,
    private authService: AuthService,
    private contactService: ContactService, // 🌟 注入
    private rsvpService: RsvpService // 🌟 注入
  ) {}

  ngOnInit() {
    this.checkTheme();
    this.loadSystemData();
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        if (typeof AOS !== 'undefined') { AOS.init({ duration: 800, once: true, offset: 50 }); AOS.refreshHard(); }
      }, 100);

      // 🌟 核心：每 10 秒自动刷新通知数据
      this.ngZone.runOutsideAngular(() => {
        this.pollingTimer = setInterval(() => {
          this.ngZone.run(() => { this.loadSystemData(true); });
        }, 10000);
      });
    }
  }

  ngOnDestroy() {
    if (this.pollingTimer) {
      clearInterval(this.pollingTimer); // 🌟 离开页面销毁计时器
    }
  }

  checkTheme() {
    if (isPlatformBrowser(this.platformId)) {
      this.isDarkMode = document.documentElement.classList.contains('dark');
    }
  }

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

  loadSystemData(isSilent: boolean = false) {
    if (isPlatformBrowser(this.platformId)) {
      const activeUser = JSON.parse(localStorage.getItem('active_user') || '{}');
      if (activeUser.fullName) { this.adminName = activeUser.fullName; }

      // 仅在首次加载时获取这些重度数据
      if (!isSilent) {
        this.authService.getAllUsers().subscribe({
          next: (users: any[]) => { this.totalUsers = users.length; },
          error: (err) => console.error("Failed to load real users", err)
        });

        this.cmsService.getCmsData('inwlab_forum_topics').subscribe({
          next: (res: any) => { try { this.totalTopics = JSON.parse(res.contentJson).length; } catch(e) {} }
        });
      }

      // 🌟 获取 Bookings
      this.bookingService.getAllBookings().subscribe({
        next: (bookings: any[]) => {
          this.activeBookings = bookings.length;

          // 兼容 Node.js 字段 (userName, roomName, purpose)
          const standardizedBookings = bookings.map((b:any) => ({
            ...b,
            safeName: b.userName || b.userEmail || 'Unknown',
            safeRoom: b.purpose || b.roomName || 'Lab Room'
          }));

          this.pendingBookings = standardizedBookings.filter((b: any) => b.status === 'Pending').sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          this.pendingCount = this.pendingBookings.length;

          // 更新日志 (仅首次加载或搜索为空时覆盖)
          if (!isSilent || this.searchQuery === '') {
            const recentBookings = [...standardizedBookings].sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).slice(0, 5);
            this.systemLogs = recentBookings.map((b: any) => ({
              time: new Date(b.createdAt).toLocaleString(),
              eventId: '#BKG-' + b.id,
              status: b.status.toUpperCase(),
              user: b.safeName,
              action: `Requested ${b.safeRoom}`,
              avatar: `https://ui-avatars.com/api/?name=${b.safeName}&background=random`
            }));
            if (this.systemLogs.length === 0) this.addDefaultLog();
            this.filteredLogs = [...this.systemLogs];
          }
        },
        error: () => { if (!isSilent) this.addDefaultLog(); }
      });

      // 🌟 获取 RSVPs
      this.rsvpService.getAllRsvps().subscribe({
        next: (data: any) => {
          this.pendingRsvpCount = data.filter((r:any) => r.status === 'Pending').length;
        }
      });

      // 🌟 获取 Contact Messages
      this.contactService.getAllMessages().subscribe({
        next: (data: any) => {
          this.unreadMessageCount = data.filter((m:any) => m.status === 'Unread').length;
        }
      });
    }
  }

  addDefaultLog() {
    this.systemLogs = [{ time: new Date().toLocaleString(), eventId: '#SYS-0001', status: 'SYSTEM', user: 'Root Admin', action: 'Command Center Initialized', avatar: 'https://ui-avatars.com/api/?name=Root+Admin' }];
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
