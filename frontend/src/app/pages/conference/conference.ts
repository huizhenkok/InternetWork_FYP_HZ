import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';

declare var AOS: any;

@Component({
  selector: 'app-conference',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './conference.html'
})
export class Conference implements OnInit, OnDestroy {
  // 默认显示 Home 页面
  activeTab: string = 'HOME';
  tabs: string[] = ['HOME', 'CALL FOR PAPER', 'REGISTRATION', 'PROGRAM BOOK'];

  // 倒计时变量
  days: string = '00';
  hours: string = '00';
  minutes: string = '00';
  seconds: string = '00';
  private timer: any;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.startCountdown('2024-11-06T00:00:00'); // 你可以随时在这里修改未来的日期

      setTimeout(() => {
        if (typeof AOS !== 'undefined') {
          AOS.init({ duration: 800, once: true, offset: 50 });
          AOS.refreshHard();
          window.scrollTo(0, 0);
        }
      }, 150);
    }
  }

  ngOnDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  setTab(tab: string) {
    this.activeTab = tab;
    setTimeout(() => {
      if (typeof AOS !== 'undefined') AOS.refreshHard();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 100);
  }

  startCountdown(targetDateString: string) {
    const targetDate = new Date(targetDateString).getTime();

    this.timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = targetDate - now;

      if (distance < 0) {
        clearInterval(this.timer);
        this.days = '00'; this.hours = '00'; this.minutes = '00'; this.seconds = '00';
        return;
      }

      const d = Math.floor(distance / (1000 * 60 * 60 * 24));
      const h = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const m = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      const s = Math.floor((distance % (1000 * 60)) / 1000);

      this.days = d < 10 ? '0' + d : d.toString();
      this.hours = h < 10 ? '0' + h : h.toString();
      this.minutes = m < 10 ? '0' + m : m.toString();
      this.seconds = s < 10 ? '0' + s : s.toString();
    }, 1000);
  }

  downloadProgramBook() {
    // 模拟下载动作，未来你可以替换成真实的 PDF 链接
    alert("Downloading NETAPPS 2024 Program Book PDF...");
    // window.open('assets/Program-Book-Netapps-2024.pdf', '_blank');
  }
}
