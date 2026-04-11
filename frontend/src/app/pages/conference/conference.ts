import { Component, OnInit, Inject, PLATFORM_ID, OnDestroy } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { ConferenceTeam } from '../people/team/conference-team/conference-team';
import { CmsService } from '../../../services/cms.service'; // 🌟 Added CmsService

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

  days: number = 0; hours: number = 0; minutes: number = 0; seconds: number = 0;
  private timer: any;

  // Variable to control full-screen image modal
  isImageModalOpen: boolean = false;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private route: ActivatedRoute,
    private cmsService: CmsService // 🌟 Inject CmsService
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.routeSub = this.route.paramMap.subscribe(params => {
        const yearParam = params.get('year');
        if (yearParam) {
          this.currentYear = yearParam;
          this.activeTab = 'HOME';
          this.loadConferenceData(this.currentYear);
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

  loadConferenceData(year: string) {
    if (isPlatformBrowser(this.platformId)) {

      // Core modification: Fetch Conference CMS data from MySQL
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
          } catch(e) {
            console.error("Error parsing Conference CMS", e);
            this.applyDefaultConfData(year);
          }
        },
        error: () => this.applyDefaultConfData(year)
      });
    }
  }

  applyDefaultConfData(year: string) {
    this.confData = {
      year: year,
      title: 'The International Conference on Internet Applications, Protocols and Services',
      shortName: 'NETAPPS',
      home: {
        paragraph1: `The International Conference on Internet Applications, Protocols and Services (NETAPPS ${year}) is a no-frills conference in the area of Internet communications and networking.`,
        paragraph2: `The main goal of this conference is to serve as an affordable platform to promote greater engagement of network researchers from around the globe...`,
        confDate: `6 & 7 November ${year}`,
        targetDate: `${year}-11-06T00:00:00`,
        date1: `August 15, ${year}`,
        date2: `Sept 30, ${year}`,
        fee1: 'RM 1,000',
        fee2: 'RM 800'
      },
      cfp: 'All papers must be original and not simultaneously submitted to another journal or conference.',
      reg: 'Registration & Final Submission details to be announced.',
      imageUrl: '',
      pdfUrl: '',
      team: []
    };
    this.setCountdownForDate(this.confData.home.targetDate);
  }

  ngOnDestroy() {
    if (this.timer) clearInterval(this.timer);
    if (this.routeSub) this.routeSub.unsubscribe();
  }

  setTab(tab: string) {
    this.activeTab = tab;
    setTimeout(() => { if (typeof AOS !== 'undefined') AOS.refreshHard(); }, 50);
  }

  setCountdownForDate(targetDateStr: string) {
    if (this.timer) clearInterval(this.timer);
    const confDate = new Date(targetDateStr);

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
    if (this.confData && this.confData.pdfUrl && this.confData.pdfUrl.trim() !== '') {
      window.open(this.confData.pdfUrl, '_blank');
    } else {
      alert(`The Official Program Book for ${this.confData.shortName} ${this.currentYear} is not available yet. Please check back later.`);
    }
  }

  // Methods to open and close image modal
  openImageModal() {
    if (this.confData && this.confData.imageUrl && this.confData.imageUrl.trim() !== '') {
      this.isImageModalOpen = true;
    }
  }

  closeImageModal() {
    this.isImageModalOpen = false;
  }
}
