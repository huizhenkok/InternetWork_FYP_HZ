import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';

declare var AOS: any;

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html'
})
export class Home implements OnInit, OnDestroy {
  conferenceDate: Date = new Date('2024-11-06T00:00:00');
  days: number = 0; hours: number = 0; minutes: number = 0; seconds: number = 0;
  private timer: any;

  // 🌟 照片轮播控制 (从 public 文件夹读取)
  bgImages: string[] = ['/b1.jpg', '/b2.jpg', '/b3.jpg', '/b4.jpg', '/b5.jpg'];
  currentBgIndex: number = 0;
  private bgTimer: any;

  // 🌟 真实数据统计
  realPublications: number = 0;
  realProjects: number = 0;
  realMembers: number = 0;

  // 🌟 CMS 动态文本
  cmsData: any = {
    heading: 'InterNetWorks Research Laboratory',
    subheading: 'Advancing the frontiers of Cybersecurity, Data Science, and Digital Innovation. A centralized platform for academic collaboration and discovery.',
    announcement: 'Leading Research Center',
    upcomingEvent: 'The 7th International Conference on Internet Applications, Protocols & Services',
    stats: { excellence: '1.2k+' } // 这里保留非动态的卓越数据 (如 Industry Partners 等)
  };

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    this.calculateCountdown();

    if (isPlatformBrowser(this.platformId)) {
      // 1. 尝试从 CMS 获取最新文本数据
      const savedCms = localStorage.getItem('inwlab_cms_home');
      if (savedCms) {
        this.cmsData = { ...this.cmsData, ...JSON.parse(savedCms) };
      }

      // 🌟 2. 抓取真实数据库的数量
      const pubs = JSON.parse(localStorage.getItem('inwlab_publications') || '[]');
      this.realPublications = pubs.filter((p: any) => p.visibility === 'Public').length; // 只算 Public

      const projs = JSON.parse(localStorage.getItem('inwlab_projects') || '[]');
      this.realProjects = projs.length; // 项目总数

      const users = JSON.parse(localStorage.getItem('inwlab_users') || '[]');
      this.realMembers = users.filter((u: any) => u.status === 'Active').length; // 活跃用户数

      // 3. 启动倒计时
      this.timer = setInterval(() => { this.calculateCountdown(); }, 1000);

      // 4. 启动背景照片渐变轮播 (每10秒切换)
      this.bgTimer = setInterval(() => {
        this.currentBgIndex = (this.currentBgIndex + 1) % this.bgImages.length;
      }, 10000);

      // 5. 启动动画
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
    if (this.timer) clearInterval(this.timer);
    if (this.bgTimer) clearInterval(this.bgTimer);
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
