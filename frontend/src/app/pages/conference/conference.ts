import { Component, OnInit, Inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute } from '@angular/router'; // 引入路由工具来获取年份
import { Subscription } from 'rxjs';

// 🌟 引入我们刚才从 People 页面移过来的 Team 组件
import { ConferenceTeam } from '../people/team/conference-team/conference-team';

declare var AOS: any;

@Component({
  selector: 'app-conference',
  standalone: true,
  imports: [CommonModule, ConferenceTeam], // 🌟 注册 ConferenceTeam
  templateUrl: './conference.html'
})
export class Conference implements OnInit, OnDestroy {
  // 🌟 新增：加入 CONFERENCE TEAM 选项
  tabs: string[] = ['HOME', 'CALL FOR PAPER', 'REGISTRATION', 'PROGRAM BOOK', 'CONFERENCE TEAM'];
  activeTab: string = 'HOME';

  // 🌟 新增：动态年份处理
  currentYear: string = '2026';
  routeSub!: Subscription;

  // 倒计时
  days: number = 0; hours: number = 0; minutes: number = 0; seconds: number = 0;
  private timer: any;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      // 🌟 监听路由里传入的年份参数
      this.routeSub = this.route.paramMap.subscribe(params => {
        const yearParam = params.get('year');
        if (yearParam) {
          this.currentYear = yearParam;
          this.activeTab = 'HOME'; // 切换年份时自动回到 HOME 标签
          this.setCountdownForYear(this.currentYear);
        }
      });

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
    if (this.timer) clearInterval(this.timer);
    if (this.routeSub) this.routeSub.unsubscribe();
  }

  setTab(tab: string) {
    this.activeTab = tab;
    setTimeout(() => {
      if (typeof AOS !== 'undefined') AOS.refreshHard();
    }, 50);
  }

  setCountdownForYear(year: string) {
    if (this.timer) clearInterval(this.timer);

    // 假设每年的会议都在当年的 11 月 6 日
    const confDate = new Date(`${year}-11-06T00:00:00`);

    this.timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = confDate.getTime() - now;

      if (distance > 0) {
        this.days = Math.floor(distance / (1000 * 60 * 60 * 24));
        this.hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        this.minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        this.seconds = Math.floor((distance % (1000 * 60)) / 1000);
      } else {
        this.days = 0; this.hours = 0; this.minutes = 0; this.seconds = 0;
      }
    }, 1000);
  }

  downloadProgramBook() {
    alert(`Downloading Official Program Book for NetApp ${this.currentYear}...`);
  }
}
