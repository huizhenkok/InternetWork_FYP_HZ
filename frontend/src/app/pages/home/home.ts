import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID, NgZone } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
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
    subheading: 'Advancing the frontiers of Cybersecurity, Data Science, and Digital Innovation. A centralized platform for academic collaboration and discovery.',
    announcement: 'Leading Research Center',
    conferenceDate: '2026-11-06T00:00:00',
    aboutTitle: 'What Is Internetworks Research Laboratory?',
    aboutPurpose: 'Our purpose is to conduct focused research on Internet protocols, applications, and technology to contribute to its evolution.',
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
    private cmsService: CmsService
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {

      // 1. 获取 Home 基础数据
      this.cmsService.getCmsData('inwlab_cms_home').subscribe({
        next: (res: any) => {
          try {
            const parsed = JSON.parse(res.contentJson);
            this.cmsData = { ...this.cmsData, ...parsed };
          } catch(e) { console.error("Error parsing Home CMS", e); }
        }
      });

      // 2. 获取 Conference 数据 (同步倒计时)
      this.cmsService.getCmsData('inwlab_cms_conferences').subscribe({
        next: (res: any) => {
          try {
            const parsed = JSON.parse(res.contentJson);
            if (parsed && parsed.length > 0) {
              parsed.sort((a: any, b: any) => parseInt(b.year) - parseInt(a.year));
              const latestConf = parsed[0];
              if (latestConf.home && latestConf.home.targetDate) {
                this.cmsData.conferenceDate = latestConf.home.targetDate;
              }
            }
          } catch(e) {}
        }
      });

      // 3. 获取 About 数据
      this.cmsService.getCmsData('inwlab_cms_about').subscribe({
        next: (res: any) => {
          try {
            const aboutParsed = JSON.parse(res.contentJson);
            this.visionMission = aboutParsed.visionMission || {};
          } catch(e) {}
        }
      });

      // 🌟 4. 获取 News 数据并合并
      this.cmsService.getCmsData('inwlab_cms_news_events').subscribe({
        next: (res: any) => {
          try {
            const newsParsed = JSON.parse(res.contentJson);

            let combinedNews: any[] = [];

            // Flagship 活动 (打上 isFlagship = true 的标签)
            if (newsParsed.flagship && newsParsed.flagship.title) {
              combinedNews.push({
                isFlagship: true, // 🌟 区分是否需要 RSVP
                title: newsParsed.flagship.title,
                desc: newsParsed.flagship.desc,
                date: newsParsed.flagship.date,
                location: newsParsed.flagship.location,
                icon: newsParsed.flagship.icon || 'star',
                imageUrl: newsParsed.flagship.imageUrl
              });
            }

            // Gatherings 新闻 (打上 isFlagship = false 的标签)
            if (newsParsed.gatherings && Array.isArray(newsParsed.gatherings)) {
              const normalNews = newsParsed.gatherings.map((g: any) => ({ ...g, isFlagship: false }));
              combinedNews = combinedNews.concat(normalNews);
            }

            this.newsList = combinedNews;
            this.startNewsCarousel();
          } catch(e) {}
        }
      });

      // 5. 统计数据
      const pubs = JSON.parse(localStorage.getItem('inwlab_publications') || '[]');
      this.realPublications = pubs.filter((p: any) => p.visibility === 'Public').length;
      const projs = JSON.parse(localStorage.getItem('inwlab_projects') || '[]');
      this.realProjects = projs.length;
      const users = JSON.parse(localStorage.getItem('inwlab_users') || '[]');
      this.realMembers = users.filter((u: any) => u.status === 'Active').length;

      this.bgTimer = setInterval(() => { this.currentBgIndex = (this.currentBgIndex + 1) % this.bgImages.length; }, 10000);

      this.calculateCountdown();
      this.timer = setInterval(() => { this.calculateCountdown(); }, 1000);

      setTimeout(() => {
        if (typeof AOS !== 'undefined') { AOS.init({ duration: 800, once: true, offset: 100 }); AOS.refreshHard(); window.scrollTo(0, 0); }
      }, 150);
    }
  }

  ngOnDestroy() {
    if (this.bgTimer) clearInterval(this.bgTimer);
    if (this.newsTimer) clearInterval(this.newsTimer);
    if (this.timer) clearInterval(this.timer);
  }

  calculateCountdown() {
    const now = new Date().getTime();
    const targetDate = new Date(this.cmsData.conferenceDate || '2026-11-06T00:00:00').getTime();
    const distance = targetDate - now;
    if (distance > 0) {
      this.days = Math.floor(distance / (1000 * 60 * 60 * 24));
      this.hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      this.minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
      this.seconds = Math.floor((distance % (1000 * 60)) / 1000);
    } else {
      this.days = 0; this.hours = 0; this.minutes = 0; this.seconds = 0;
    }
  }

  formatNumber(num: number): string { return num < 10 ? `0${num}` : num.toString(); }

  startNewsCarousel() {
    if (this.newsList.length > 1) {
      this.ngZone.runOutsideAngular(() => {
        this.newsTimer = setInterval(() => {
          this.ngZone.run(() => {
            this.currentNewsIndex = (this.currentNewsIndex + 1) % this.newsList.length;
          });
        }, 5000);
      });
    }
  }

  setNewsIndex(index: number) {
    this.currentNewsIndex = index;
    if (this.newsTimer) clearInterval(this.newsTimer);
    this.startNewsCarousel();
  }
}
