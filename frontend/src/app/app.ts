import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { Navbar } from './components/navbar/navbar';
import { Footer } from './footer/footer'; // 🌟 成功引入 Footer 组件

declare var AOS: any; // 🌟 声明全局动画引擎

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, Navbar, Footer], // 🌟 把 Footer 挂载到主程序里
  templateUrl: './app.html' // 或者叫 ./app.component.html
})
export class App implements OnInit {
  isDarkMode = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

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

      // 🌟 修复问题2：切换黑白模式时，强制重播所有元素的出场动画
      if (triggerAnimation && typeof AOS !== 'undefined') {
        setTimeout(() => {
          // 1. 拔掉所有元素的“已播放动画”标记，让它们回到初始透明状态
          const animatedElements = document.querySelectorAll('[data-aos]');
          animatedElements.forEach(el => {
            el.classList.remove('aos-animate');
          });

          // 2. 强行刷新引擎，并用代码模拟“鼠标轻微滚动”，瞬间触发全新出场动画！
          setTimeout(() => {
            AOS.refreshHard();
            window.scrollTo({ top: window.scrollY + 1, behavior: 'instant' });
            window.scrollTo({ top: window.scrollY - 1, behavior: 'instant' });
          }, 50);
        }, 50); // 给浏览器留 50ms 切换黑白颜色的时间
      }
    }
  }
}
