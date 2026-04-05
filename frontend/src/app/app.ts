import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterOutlet, Router } from '@angular/router'; // 🌟 引入 Router
import { Navbar } from './components/navbar/navbar';
import { Footer } from './footer/footer';

declare var AOS: any;

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, Navbar, Footer],
  templateUrl: './app.html'
})
export class App implements OnInit {
  isDarkMode = false;

  // 🌟 注入 Router
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

  // 🌟 核心魔法：判断当前是不是 Login / Sign Up / Forget Password 页面
  get isAuthPage(): boolean {
    const url = this.router.url;
    return url.includes('/login') || url.includes('/sign-up') || url.includes('/forget-password');
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
            window.scrollTo({ top: window.scrollY + 1, behavior: 'instant' });
            window.scrollTo({ top: window.scrollY - 1, behavior: 'instant' });
          }, 50);
        }, 50);
      }
    }
  }
}
