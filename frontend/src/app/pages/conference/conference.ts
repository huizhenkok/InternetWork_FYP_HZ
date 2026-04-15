import { Component, OnInit, Inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { ConferenceTeam } from '../people/team/conference-team/conference-team';
import { CmsService } from '../../../services/cms.service';

declare var AOS: any;

@Component({
  selector: 'app-conference',
  standalone: true,
  imports: [CommonModule, ConferenceTeam],
  templateUrl: './conference.html'
})
export class Conference implements OnInit, OnDestroy {
  tabs: string[] = ['HOME', 'CALL FOR PAPER', 'REGISTRATION', 'PROGRAM BOOK', 'CONFERENCE TEAM'];
  activeTab: string = 'HOME';
  currentYear: string = '2026';
  routeSub!: Subscription;
  confData: any = null;
  isLoading: boolean = true; // 🌟 增加加载状态

  days: number = 0; hours: number = 0; minutes: number = 0; seconds: number = 0;
  private timer: any;
  isImageModalOpen: boolean = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private route: ActivatedRoute,
    private cmsService: CmsService
  ) {}

  // 🌟 全局统一的图片/文件修复逻辑 (覆盖了旧的)
  public fixUrl(url: string | undefined): string {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url.replace('http://localhost:8080', 'https://internetworks.my').replace('https://internetwork-fyp-hz.onrender.com', 'https://internetworks.my');
    }
    return url.startsWith('/') ? `https://internetworks.my${url}` : `https://internetworks.my/${url}`;
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.routeSub = this.route.paramMap.subscribe(params => {
        const yearParam = params.get('year');
        if (yearParam) {
          this.currentYear = yearParam;
          this.activeTab = 'HOME';
          this.isLoading = true; // 开始加载
          this.loadConferenceData(this.currentYear);
        }
      });
    }
  }

  loadConferenceData(year: string) {
    this.cmsService.getCmsData('inwlab_cms_conferences').subscribe({
      next: (res: any) => {
        try {
          const allConferences = JSON.parse(res.contentJson);
          const foundConf = allConferences.find((c: any) => c.year === year);
          if (foundConf) {
            this.confData = foundConf;
            this.setCountdownForDate(this.confData.home.targetDate);
          } else {
            this.applyDefaultConfData(year);
          }
        } catch(e) { this.applyDefaultConfData(year); }
        this.finishLoading();
      },
      error: () => { this.applyDefaultConfData(year); this.finishLoading(); }
    });
  }

  finishLoading() {
    this.isLoading = false;
    setTimeout(() => { if (typeof AOS !== 'undefined') { AOS.init({ duration: 800, once: true, offset: 50 }); AOS.refreshHard(); window.scrollTo(0, 0); } }, 150);
  }

  applyDefaultConfData(year: string) {
    this.confData = { year: year, title: 'The International Conference on Internet Applications', shortName: 'NETAPPS', home: { paragraph1: `...`, paragraph2: `...`, confDate: `6 & 7 November ${year}`, targetDate: `${year}-11-06T00:00:00`, date1: `August 15, ${year}`, date2: `Sept 30, ${year}`, fee1: 'RM 1,000', fee2: 'RM 800' }, cfp: 'All papers must be original...', reg: 'Registration details...', imageUrl: '', pdfUrl: '', team: [] };
    this.setCountdownForDate(this.confData.home.targetDate);
  }

  ngOnDestroy() {
    if (this.timer) clearInterval(this.timer);
    if (this.routeSub) this.routeSub.unsubscribe();
  }

  setTab(tab: string) { this.activeTab = tab; setTimeout(() => { if (typeof AOS !== 'undefined') AOS.refreshHard(); }, 50); }

  setCountdownForDate(targetDateStr: string) {
    if (this.timer) clearInterval(this.timer);
    const confDate = new Date(targetDateStr);
    this.timer = setInterval(() => {
      const distance = confDate.getTime() - new Date().getTime();
      if (distance > 0) {
        this.days = Math.floor(distance / (1000 * 60 * 60 * 24)); this.hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)); this.minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)); this.seconds = Math.floor((distance % (1000 * 60)) / 1000);
      } else { this.days = this.hours = this.minutes = this.seconds = 0; }
    }, 1000);
  }

  downloadProgramBook() {
    if (this.confData?.pdfUrl) window.open(this.fixUrl(this.confData.pdfUrl), '_blank');
    else alert(`Program Book not available yet.`);
  }

  openImageModal() { if (this.confData?.imageUrl) this.isImageModalOpen = true; }
  closeImageModal() { this.isImageModalOpen = false; }
}
