import { Component, OnInit, Inject, PLATFORM_ID, NgZone } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

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

      // Note: Kept in localStorage until Spring Boot 'getAllUsers' API is implemented
      const storedUsers = JSON.parse(localStorage.getItem('inwlab_users') || '[]');

      this.allUsers = storedUsers.map((user: any) => ({
        ...user,
        displayName: user.fullName || user.name || (user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Unknown User'),
        email: user.email || 'No Email Provided',
        role: user.role || 'Member',
        status: user.status || 'Active'
      }));

      this.filteredUsers = [...this.allUsers];
      this.calculateStats();
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

  toggleUserStatus(user: any) {
    if (isPlatformBrowser(this.platformId)) {
      const action = user.status === 'Active' ? 'BAN' : 'UNBAN';
      if (confirm(`Are you sure you want to ${action} ${user.displayName}?`)) {
        user.status = user.status === 'Active' ? 'Banned' : 'Active';
        this.saveUsersToDB();
      }
    }
  }

  deleteUser(index: number, userName: string) {
    if (isPlatformBrowser(this.platformId)) {
      if (confirm(`CRITICAL WARNING: Are you sure you want to PERMANENTLY DELETE ${userName}? This action cannot be undone.`)) {
        const userToDelete = this.filteredUsers[index];
        const realIndex = this.allUsers.findIndex(u => u === userToDelete);

        if (realIndex !== -1) {
          this.allUsers.splice(realIndex, 1);
          this.filterUsers();
          this.saveUsersToDB();
        }
      }
    }
  }

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
