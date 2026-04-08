import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { Navbar } from './components/navbar/navbar';
import { Footer } from './footer/footer';
import { InternalNavbar } from './components/internal-navbar/internal-navbar';

declare var AOS: any;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, Navbar, Footer, InternalNavbar],
  templateUrl: './app.html'
})
export class App implements OnInit {
  isDarkMode = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object, public router: Router) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      const savedTheme = localStorage.getItem('inwlab-theme');
      if (savedTheme === 'dark') {
        this.setDarkMode(true, false);
      } else {
        this.setDarkMode(false, false);
      }
    }
  }

  // 🌟 判断是否为无需 Navbar/Footer 的页面
  // 注意：url.includes('/admin') 会自动拦截所有 /admin-dashboard, /admin-cms 等页面！
  get isAuthPage(): boolean {
    const url = this.router.url;
    return url.includes('/login') ||
      url.includes('/sign-up') ||
      url.includes('/forget-password') ||
      url.includes('/admin');
  }

  // 🌟 判断是否为学生/教职员的内部系统页面 (显示专属的 Internal Navbar)
  get isInternalPage(): boolean {
    const url = this.router.url;
    return url.includes('/student') ||
      url.includes('/alumni') ||
      url.includes('/faculty') ||
      url.includes('/my-profile') ||
      url.includes('/booking') ||
      url.includes('/forum-activity') ||
      url.includes('/publication') ||
      url.includes('/archive');
  }

  toggleTheme() {
    this.setDarkMode(!this.isDarkMode, true);
  }

  private setDarkMode(isDark: boolean, triggerAnimation: boolean) {
    this.isDarkMode = isDark;

    if (isPlatformBrowser(this.platformId)) {
      const root = document.documentElement;
      if (isDark) {
        root.classList.add('dark');
        localStorage.setItem('inwlab-theme', 'dark');
      } else {
        root.classList.remove('dark');
        localStorage.setItem('inwlab-theme', 'light');
      }

      // 处理 AOS 动画的刷新
      if (triggerAnimation && typeof AOS !== 'undefined') {
        setTimeout(() => {
          const animatedElements = document.querySelectorAll('[data-aos]');
          animatedElements.forEach(el => el.classList.remove('aos-animate'));
          setTimeout(() => {
            AOS.refreshHard();
          }, 50);
        }, 50);
      }
    }
  }
}
