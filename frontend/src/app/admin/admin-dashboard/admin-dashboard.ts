import { Component, OnInit, Inject, PLATFORM_ID, NgZone } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms'; // 🌟 必须引入用于双向绑定

declare var AOS: any;

@Component({
  selector: 'app-admin-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule], // 🌟 加入 FormsModule
  templateUrl: './admin-dashboard.html'
})
export class AdminDashboard implements OnInit {

  totalUsers: number = 0;
  activeBookings: number = 0;
  totalTopics: number = 0;

  systemLogs: any[] = [];
  filteredLogs: any[] = []; // 🌟 用于搜索过滤的日志数组
  searchQuery: string = ''; // 🌟 绑定的搜索词

  adminName: string = 'System Admin';

  // 🌟 通知系统状态
  showNotifications: boolean = false;
  pendingBookings: any[] = [];
  pendingCount: number = 0;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private ngZone: NgZone,
    private router: Router
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

      // 获取各项总数
      const users = JSON.parse(localStorage.getItem('inwlab_users') || '[]');
      const bookings = JSON.parse(localStorage.getItem('inwlab_bookings') || '[]');
      const topics = JSON.parse(localStorage.getItem('inwlab_forum_topics') || '[]');

      this.totalUsers = users.length;
      this.activeBookings = bookings.length;
      this.totalTopics = topics.length;

      // 🌟 核心：计算待审批的预约 (通知系统)
      this.pendingBookings = bookings.filter((b: any) => b.status === 'Pending')
        .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      this.pendingCount = this.pendingBookings.length;

      // 生成最近的系统日志
      const recentBookings = [...bookings]
        .sort((a: any, b: any) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 5);

      this.systemLogs = recentBookings.map((b: any) => ({
        time: new Date(b.timestamp).toLocaleString(),
        eventId: '#BKG-' + Math.floor(1000 + Math.random() * 9000),
        status: b.status.toUpperCase(),
        user: b.userName || b.name || 'Unknown User',
        action: `Requested ${b.roomName}`,
        avatar: `http://googleusercontent.com/profile/picture/${Math.floor(Math.random() * 10)}`
      }));

      if (this.systemLogs.length === 0) {
        this.systemLogs.push({
          time: new Date().toLocaleString(),
          eventId: '#SYS-0001',
          status: 'SYSTEM',
          user: 'Root Admin',
          action: 'Command Center Initialized',
          avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBu-QHK2bRGqtLLmojWpxlA6gWMXlDzIcGkgEZkxZ4tRoME2ax9-qlQu3G6ETm_secv4WpStFn5C7HmrVlUVDsQEGpSHQMYU_jCV_5uonKERqKBehLM1NkoerJ1gsUFKXUJ-WdpCpWo2ubaE9hkvrQOyFcU9m7FqTdmEeiMZX9k8LHhMRFG7Y4nuVl3Ldt0enjI-swgoEcJ9RL1ZdFmzaK6YD9WKT30WuE-D98ZA1vZAdQwkasDN5FxUs-TrsppYRzONIcd6_pqvwbc'
        });
      }

      // 初始化过滤数组
      this.filteredLogs = [...this.systemLogs];
    }
  }

  // 🌟 通知铃铛切换
  toggleNotifications() {
    this.showNotifications = !this.showNotifications;
  }

  // 🌟 日志搜索过滤
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
