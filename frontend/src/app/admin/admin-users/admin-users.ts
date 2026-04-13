import { Component, OnInit, Inject, PLATFORM_ID, NgZone } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service'; // 🌟 引入 AuthService

declare var AOS: any;

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './admin-users.html'
})
export class AdminUsers implements OnInit {

  adminName: string = 'System Admin';
  allUsers: any[] = [];
  filteredUsers: any[] = [];
  searchQuery: string = '';

  totalUsers: number = 0;
  activeUsers: number = 0;
  bannedUsers: number = 0;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private ngZone: NgZone,
    private router: Router,
    private authService: AuthService // 🌟 注入
  ) {}

  ngOnInit() {
    this.loadData();
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        if (typeof AOS !== 'undefined') { AOS.init({ duration: 800, once: true, offset: 50 }); AOS.refreshHard(); }
      }, 100);
    }
  }

  loadData() {
    if (isPlatformBrowser(this.platformId)) {
      const activeUser = JSON.parse(localStorage.getItem('active_user') || '{}');
      if (activeUser.fullName) this.adminName = activeUser.fullName;

      // 🌟 Req 1: 彻底抛弃 localStorage，从 MySQL 获取全部用户！
      this.authService.getAllUsers().subscribe({
        next: (users: any[]) => {
          this.allUsers = users.map((user: any) => ({
            ...user,
            // 确保有个展示名
            displayName: user.fullName || user.email.split('@')[0],
            // 如果后端还没有实现 ban 字段，先默认 Active
            status: user.status || 'Active'
          }));
          this.filteredUsers = [...this.allUsers];
          this.calculateStats();
        },
        error: (err) => {
          console.error("Error loading users from database", err);
          alert("Failed to load users from the server.");
        }
      });
    }
  }

  calculateStats() {
    this.totalUsers = this.allUsers.length;
    this.activeUsers = this.allUsers.filter(u => u.status === 'Active').length;
    this.bannedUsers = this.allUsers.filter(u => u.status === 'Banned').length;
  }

  filterUsers() {
    const query = this.searchQuery.toLowerCase().trim();
    if (!query) {
      this.filteredUsers = [...this.allUsers];
      return;
    }

    this.filteredUsers = this.allUsers.filter(user =>
      user.displayName.toLowerCase().includes(query) ||
      user.email.toLowerCase().includes(query) ||
      user.role.toLowerCase().includes(query)
    );
  }

  // ⚠️ 注意：这只是前端状态模拟，如果要真正在后端封禁，需要再写一个 update API
  toggleUserStatus(user: any) {
    if (isPlatformBrowser(this.platformId)) {
      const action = user.status === 'Active' ? 'BAN' : 'UNBAN';
      if (confirm(`Are you sure you want to ${action} ${user.displayName}?`)) {
        user.status = user.status === 'Active' ? 'Banned' : 'Active';
        this.calculateStats();
      }
    }
  }

  // ⚠️ 同上，如果要在后端真删除，需要调用 deleteUser API
  deleteUser(index: number, userName: string) {
    if (isPlatformBrowser(this.platformId)) {
      if (confirm(`CRITICAL WARNING: Are you sure you want to PERMANENTLY DELETE ${userName}? This action cannot be undone.`)) {
        const userToDelete = this.filteredUsers[index];
        const realIndex = this.allUsers.findIndex(u => u === userToDelete);

        if (realIndex !== -1) {
          this.allUsers.splice(realIndex, 1);
          this.filterUsers();
          this.calculateStats();
        }
      }
    }
  }

  logout() {
    if (confirm("Are you sure you want to logout?")) {
      localStorage.removeItem('active_user');
      this.router.navigate(['/login']);
    }
  }
}
