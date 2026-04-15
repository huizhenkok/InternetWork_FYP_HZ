import { Component, Input, Output, EventEmitter, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';

@Component({
  selector: 'app-internal-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './internal-navbar.html'
})
export class InternalNavbar implements OnInit {
  @Input() isDarkMode = false;
  @Output() toggleThemeEvent = new EventEmitter<void>();

  // 🌟 动态 Home 链接：默认去 student
  homeLink: string = '/student';

  // 🌟 声明 userRole 变量，用于 HTML 里的 *ngIf 判断
  userRole: string = '';

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (this.router.url.includes('/alumni')) {
      this.homeLink = '/alumni';
    } else if (this.router.url.includes('/faculty')) {
      this.homeLink = '/faculty'; // 🌟 新增 Faculty 判断
    }

    // 🌟 核心：在初始化时，从 localStorage 获取当前用户的角色 (Role)
    if (isPlatformBrowser(this.platformId)) {
      try {
        const activeUser = JSON.parse(localStorage.getItem('active_user') || '{}');
        this.userRole = activeUser.role || '';
      } catch (e) {
        console.error("Error reading user role:", e);
        this.userRole = '';
      }
    }
  }

  toggleTheme() {
    this.toggleThemeEvent.emit();
  }
}
