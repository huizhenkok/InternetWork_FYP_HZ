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

  homeLink: string = '/student';
  userRole: string = '';
  isMobileMenuOpen = false; // 🌟 新增移动端菜单开关

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (this.router.url.includes('/alumni')) {
      this.homeLink = '/alumni';
    } else if (this.router.url.includes('/faculty')) {
      this.homeLink = '/faculty';
    }

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

  toggleTheme() { this.toggleThemeEvent.emit(); }

  // 🌟 移动端菜单控制方法
  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    if (this.isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
    document.body.style.overflow = 'auto';
  }
}
