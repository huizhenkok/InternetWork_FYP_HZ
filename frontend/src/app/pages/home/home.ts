import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router'; // 🌟 换回 RouterModule

declare var AOS: any;

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],// 🌟 这里也改回来
  templateUrl: './home.html'
})
export class Home implements OnInit, OnDestroy {
  conferenceDate: Date = new Date('2024-11-06T00:00:00');

  days: number = 0;
  hours: number = 0;
  minutes: number = 0;
  seconds: number = 0;

  private timer: any;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    this.calculateCountdown();

    if (isPlatformBrowser(this.platformId)) {
      this.timer = setInterval(() => {
        this.calculateCountdown();
      }, 1000);

      setTimeout(() => {
        if (typeof AOS !== 'undefined') {
          AOS.init({ duration: 800, once: true, offset: 100 });
          AOS.refreshHard();
          window.scrollTo(0, 0);
          window.dispatchEvent(new Event('scroll'));
        }
      }, 150);
    }
  }

  ngOnDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  calculateCountdown() {
    const now = new Date().getTime();
    const distance = this.conferenceDate.getTime() - now;

    if (distance > 0) {
      this.days = Math.floor(distance / (1000 * 60 * 60 * 24));
      this.hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      this.minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      this.seconds = Math.floor((distance % (1000 * 60)) / 1000);
    } else {
      this.days = 0; this.hours = 0; this.minutes = 0; this.seconds = 0;
    }
  }

  formatNumber(num: number): string {
    return num < 10 ? `0${num}` : num.toString();
  }
}
