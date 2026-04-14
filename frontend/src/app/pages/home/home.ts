import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID, NgZone } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http'; // 🌟 引入 HttpClient 用于直接抓取统计数据
import { CmsService } from '../../../services/cms.service';

declare var AOS: any;

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './home.html'
})
export class Home implements OnInit, OnDestroy {

  days: number = 0; hours: number = 0; minutes: number = 0; seconds: number = 0;
  private timer: any;

  bgImages: string[] = ['/b1.jpg', '/b2.jpg', '/b3.jpg', '/b4.jpg', '/b5.jpg'];
  currentBgIndex: number = 0;
  private bgTimer: any;

  realPublications: number = 0;
  realProjects: number = 0;
  realMembers: number = 0;

  cmsData: any = {
    heading: 'InterNetWorks Research Laboratory',
    subheading: 'Advancing the frontiers of Cybersecurity, Data Science, and Digital Innovation.',
    announcement: 'Leading Research Center',
    conferenceDate: '2026-11-06T00:00:00',
    aboutTitle: 'What Is Internetworks Research Laboratory?',
    aboutPurpose: 'Our purpose is to conduct focused research...',
    aboutImage: '',
    stats: { activePhds: '85+', globalAwards: '42', industryPartners: '200+' }
  };

  visionMission: any = {};
  newsList: any[] = [];
  currentNewsIndex: number = 0;
  private newsTimer: any;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private ngZone: NgZone,
    private cmsService: CmsService,
    private http: HttpClient // 🌟 注入 HttpClient
  ) {}

  // 🌟 终极图片修复魔法：把数据库里旧的 localhost 强制替换成云端地址
  public fixUrl(url: string): string {
    if (!url) return '';
    return url.replace('http://localhost:8080', 'https://internetwork-fyp-hz.onrender.com');
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadCmsData();
      this.loadRealStatistics(); // 🌟 加载真实统计数字

      this.bgTimer = setInterval(() => { this.currentBgIndex = (this.currentBgIndex + 1) % this.bgImages.length; }, 10000);
      this.calculateCountdown();
      this.timer = setInterval(() => { this.calculateCountdown(); }, 1000);

      setTimeout(() => {
        if (typeof AOS !== 'undefined') { AOS.init({ duration: 800, once: true, offset: 100 }); AOS.refreshHard(); window.scrollTo(0, 0); }
      }, 150);
    }
  }

  loadRealStatistics() {
    // 1. 抓取真实活跃用户数量
    this.http.get('https://internetwork-fyp-hz.onrender.com/api/users/all').subscribe({
      next: (users: any) => { this.realMembers = users.length; },
      error: () => { this.realMembers = 0; }
    });

    // 2. 抓取真实 Publication 数量
    this.cmsService.getCmsData('inwlab_cms_publications').subscribe({
      next: (res: any) => {
        try {
          const pubs = JSON.parse(res.contentJson);
          this.realPublications = pubs.length || 0;
        } catch(e) {}
      }
    });

    // 3. 抓取真实 Projects 数量
    this.cmsService.getCmsData('inwlab_cms_projects').subscribe({
      next: (res: any) => {
        try {
          const projs = JSON.parse(res.contentJson);
          this.realProjects = projs.length || 0;
        } catch(e) {}
      }
    });
  }

  loadCmsData() {
    this.cmsService.getCmsData('inwlab_cms_home').subscribe(res => {
      try { this.cmsData = { ...this.cmsData, ...JSON.parse(res.contentJson) }; } catch(e) {}
    });
    this.cmsService.getCmsData('inwlab_cms_conferences').subscribe(res => {
      try {
        const parsed = JSON.parse(res.contentJson);
        if (parsed?.length > 0) {
          parsed.sort((a: any, b: any) => parseInt(b.year) - parseInt(a.year));
          this.cmsData.conferenceDate = parsed[0].home.targetDate;
        }
      } catch(e) {}
    });
    this.cmsService.getCmsData('inwlab_cms_about').subscribe(res => {
      try { this.visionMission = JSON.parse(res.contentJson).visionMission || {}; } catch(e) {}
    });
    this.cmsService.getCmsData('inwlab_cms_news_events').subscribe(res => {
      try {
        const parsed = JSON.parse(res.contentJson);
        let combined = [];
        if (parsed.flagship?.title) combined.push({ ...parsed.flagship, isFlagship: true });
        if (Array.isArray(parsed.gatherings)) combined = combined.concat(parsed.gatherings.map((g: any) => ({...g, isFlagship: false})));
        this.newsList = combined;
        this.startNewsCarousel();
      } catch(e) {}
    });
  }

  ngOnDestroy() {
    if (this.bgTimer) clearInterval(this.bgTimer);
    if (this.newsTimer) clearInterval(this.newsTimer);
    if (this.timer) clearInterval(this.timer);
  }

  calculateCountdown() {
    const now = new Date().getTime();
    const distance = new Date(this.cmsData.conferenceDate || '2026-11-06T00:00:00').getTime() - now;
    if (distance > 0) {
      this.days = Math.floor(distance / (1000 * 60 * 60 * 24));
      this.hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      this.minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      this.seconds = Math.floor((distance % (1000 * 60)) / 1000);
    } else {
      this.days = this.hours = this.minutes = this.seconds = 0;
    }
  }

  formatNumber(num: number): string { return num < 10 ? `0${num}` : num.toString(); }

  startNewsCarousel() {
    if (this.newsList.length > 1) {
      this.ngZone.runOutsideAngular(() => {
        this.newsTimer = setInterval(() => { this.ngZone.run(() => { this.currentNewsIndex = (this.currentNewsIndex + 1) % this.newsList.length; }); }, 5000);
      });
    }
  }
  setNewsIndex(index: number) { this.currentNewsIndex = index; if (this.newsTimer) clearInterval(this.newsTimer); this.startNewsCarousel(); }
}
