import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router';
import { Navbar } from './components/navbar/navbar';
import { Footer } from './footer/footer';
import { InternalNavbar } from './components/internal-navbar/internal-navbar'; // 🌟 引入刚建好的专属 Navbar

declare var AOS: any;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, Navbar, Footer, InternalNavbar], // 🌟 必须把它放进 imports 里
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

  // 判断是否为登录/注册验证页 (不显示任何 Navbar)
  get isAuthPage(): boolean {
    const url = this.router.url;
    return url.includes('/login') || url.includes('/sign-up') || url.includes('/forget-password');
  }

  // 🌟 判断是否为内部系统页面 (显示专属 Navbar)
  // 判断是否为内部系统页面 (显示专属 Navbar)
  get isInternalPage(): boolean {
    const url = this.router.url;
    return url.includes('/student') || url.includes('/alumni') || url.includes('/faculty') || // 🌟 加了 faculty
      url.includes('/my-profile') || url.includes('/booking') ||
      url.includes('/forum-activity') || url.includes('/publication');
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
