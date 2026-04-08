import { Component, OnInit, Inject, PLATFORM_ID, NgZone } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms'; // 🌟 必须引入 FormsModule 才能用双向绑定搜索

declare var AOS: any;

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule], // 🌟 加入 FormsModule
  templateUrl: './admin-users.html'
})
export class AdminUsers implements OnInit {

  adminName: string = 'System Admin';
  allUsers: any[] = [];
  filteredUsers: any[] = []; // 🌟 用于搜索过滤的数组
  searchQuery: string = '';  // 🌟 绑定的搜索词

  // 顶部统计数据
  totalUsers: number = 0;
  activeUsers: number = 0;
  bannedUsers: number = 0;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private ngZone: NgZone,
    private router: Router
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

      // 从 localStorage 获取真实注册的用户
      const storedUsers = JSON.parse(localStorage.getItem('inwlab_users') || '[]');

      // 🌟 核心修复：处理名字字段不匹配的问题，统一格式化为一个安全的 displayName
      this.allUsers = storedUsers.map((user: any) => ({
        ...user,
        // 智能抓取名字：如果有 fullName 就用，没有就合并 firstName 和 lastName，再没有就叫 Unknown
        displayName: user.fullName || user.name || (user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Unknown User'),
        email: user.email || 'No Email Provided',
        role: user.role || 'Member',
        status: user.status || 'Active'
      }));

      // 初始化时，过滤数组等于所有用户
      this.filteredUsers = [...this.allUsers];

      this.calculateStats();
    }
  }

  calculateStats() {
    this.totalUsers = this.allUsers.length;
    this.activeUsers = this.allUsers.filter(u => u.status === 'Active').length;
    this.bannedUsers = this.allUsers.filter(u => u.status === 'Banned').length;
  }

  // 🌟 核心新增：实时搜索过滤逻辑
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

  // 🌟 封禁/解封用户
  toggleUserStatus(user: any) {
    if (isPlatformBrowser(this.platformId)) {
      const action = user.status === 'Active' ? 'BAN' : 'UNBAN';
      if (confirm(`Are you sure you want to ${action} ${user.displayName}?`)) {
        user.status = user.status === 'Active' ? 'Banned' : 'Active';
        this.saveUsersToDB();
      }
    }
  }

  // 🌟 彻底删除用户
  deleteUser(index: number, userName: string) {
    if (isPlatformBrowser(this.platformId)) {
      if (confirm(`CRITICAL WARNING: Are you sure you want to PERMANENTLY DELETE ${userName}? This action cannot be undone.`)) {
        // 🌟 修复：必须从 allUsers 里找到真正的索引来删除，不能直接用 filteredUsers 的 index
        const userToDelete = this.filteredUsers[index];
        const realIndex = this.allUsers.findIndex(u => u === userToDelete);

        if (realIndex !== -1) {
          this.allUsers.splice(realIndex, 1);
          this.filterUsers(); // 重新过滤更新画面
          this.saveUsersToDB();
        }
      }
    }
  }

  // 统一保存
  saveUsersToDB() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('inwlab_users', JSON.stringify(this.allUsers));
      this.calculateStats();
    }
  }

  logout() {
    if (confirm("Are you sure you want to logout?")) {
      localStorage.removeItem('active_user');
      this.router.navigate(['/login']);
    }
  }
}
