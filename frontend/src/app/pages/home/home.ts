import { Component, OnInit, OnDestroy, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CmsService } from '../../../services/cms.service'; // 🌟 引入 CmsService

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
    upcomingEvent: 'The 7th International Conference on Internet Applications, Protocols & Services',
    upcomingEventDesc: 'NETAPPS2024 is a premier platform to promote greater engagement of network researchers from around the globe...',
    conferenceDate: '2026-11-06T00:00:00',
    stats: { activePhds: '85+', globalAwards: '42', industryPartners: '200+' }
  };

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private cmsService: CmsService // 🌟 注入 CmsService
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {

      // 🌟 核心修改：从真实数据库拉取 Home 数据
      this.cmsService.getCmsData('inwlab_cms_home').subscribe({
        next: (res: any) => {
          try {
            const parsed = JSON.parse(res.contentJson);
            this.cmsData = { ...this.cmsData, ...parsed };
          } catch(e) { console.error("Error parsing Home CMS", e); }
        },
        error: () => console.log('Using default Home data')
      });

      // 暂留本地统计逻辑（后续可以接真实数据库的统计）
      const pubs = JSON.parse(localStorage.getItem('inwlab_publications') || '[]');
      this.realPublications = pubs.filter((p: any) => p.visibility === 'Public').length;
      const projs = JSON.parse(localStorage.getItem('inwlab_projects') || '[]');
      this.realProjects = projs.length;
      const users = JSON.parse(localStorage.getItem('inwlab_users') || '[]');
      this.realMembers = users.filter((u: any) => u.status === 'Active').length;

      this.calculateCountdown();
      this.timer = setInterval(() => { this.calculateCountdown(); }, 1000);
      this.bgTimer = setInterval(() => { this.currentBgIndex = (this.currentBgIndex + 1) % this.bgImages.length; }, 10000);

      setTimeout(() => {
        if (typeof AOS !== 'undefined') { AOS.init({ duration: 800, once: true, offset: 100 }); AOS.refreshHard(); window.scrollTo(0, 0); }
      }, 150);
    }
  }

  ngOnDestroy() {
    if (this.timer) clearInterval(this.timer);
    if (this.bgTimer) clearInterval(this.bgTimer);
  }

  calculateCountdown() {
    const now = new Date().getTime();
    const targetDate = new Date(this.cmsData.conferenceDate).getTime();
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
}
