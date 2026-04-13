import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RsvpService } from '../../../services/rsvp.service';
import { CmsService } from '../../../services/cms.service';

declare var AOS: any;

@Component({
  selector: 'app-news',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './news.html'
})
export class News implements OnInit {

  cmsData: any = {
    mainTitle: 'NEWS',
    mainTitleHighlight: '& EVENTS',
    subTitle: 'Stay synchronized with our latest research breakthroughs, lab upgrades, and upcoming academic gatherings.',
    flagship: {
      badge: 'Flagship Event', date: 'NOV 6-7, 2026', location: 'ALOR SETAR',
      title: 'NETAPPS 2026 Summit', desc: 'Join us for an immersive discussion on the next horizon of decentralized protocols and network defense strategies.', icon: 'hub'
    },
    gatheringsTitle: 'LATEST NEWS',
    gatherings: [],
    quickUpdatesTitle: 'QUICK UPDATES',
    quickUpdates: [],
    quoteText: '"Innovation in networking is not just about speed, but securing the foundation of tomorrow\'s digital society."',
    quoteAuthor: 'INWLab Vision'
  };

  // RSVP 状态
  isRsvpModalOpen: boolean = false;
  rsvpEventName: string = '';
  isSubmittingRsvp: boolean = false;
  isRsvpSuccess: boolean = false;
  rsvpData = { name: '', email: '', role: 'UUM Student', message: '' };

  // 🌟 新增：News 详情弹窗状态
  isNewsModalOpen: boolean = false;
  selectedNews: any = null;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private rsvpService: RsvpService,
    private cmsService: CmsService
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.cmsService.getCmsData('inwlab_cms_news_events').subscribe({
        next: (res: any) => {
          try {
            const parsed = JSON.parse(res.contentJson);
            this.cmsData = { ...this.cmsData, ...parsed };
          } catch(e) { console.error("Error parsing News CMS", e); }
        }
      });

      setTimeout(() => {
        if (typeof AOS !== 'undefined') { AOS.init({ duration: 800, once: true, offset: 50 }); AOS.refreshHard(); window.scrollTo(0, 0); }
      }, 150);
    }
  }

  // --- RSVP 逻辑 (针对 Flagship Event) ---
  handleRSVP(eventName: string) {
    this.rsvpEventName = eventName;
    this.isRsvpModalOpen = true;
    this.isRsvpSuccess = false;

    if (isPlatformBrowser(this.platformId)) {
      const activeUser = JSON.parse(localStorage.getItem('active_user') || '{}');
      if (activeUser.email) {
        this.rsvpData.email = activeUser.email;
        this.rsvpData.name = activeUser.fullName || '';
        this.rsvpData.role = activeUser.role === 'Faculty' ? 'Faculty' : 'UUM Student';
      }
    }
  }

  closeRsvpModal() { this.isRsvpModalOpen = false; }

  submitRSVP() {
    if (!this.rsvpData.name || !this.rsvpData.email) { alert("Please fill in your Name and Email."); return; }
    this.isSubmittingRsvp = true;
    const payload = { eventName: this.rsvpEventName, name: this.rsvpData.name, email: this.rsvpData.email, role: this.rsvpData.role, message: this.rsvpData.message };

    this.rsvpService.submitRsvp(payload).subscribe({
      next: () => {
        this.isSubmittingRsvp = false; this.isRsvpSuccess = true;
        setTimeout(() => { this.closeRsvpModal(); this.rsvpData = { name: '', email: '', role: 'UUM Student', message: '' }; }, 2000);
      },
      error: (err: any) => {
        this.isSubmittingRsvp = false; console.error("RSVP Error:", err); alert("Failed to submit RSVP.");
      }
    });
  }

  // --- 🌟 新增：News 详情逻辑 ---
  openNewsModal(newsItem: any) {
    this.selectedNews = newsItem;
    this.isNewsModalOpen = true;
    if (isPlatformBrowser(this.platformId)) document.body.style.overflow = 'hidden';
  }

  closeNewsModal() {
    this.isNewsModalOpen = false;
    if (isPlatformBrowser(this.platformId)) document.body.style.overflow = 'auto';
    setTimeout(() => this.selectedNews = null, 300); // 等动画结束清空数据
  }

  async shareEvent(eventName: string) {
    const shareData = { title: `INWLab: ${eventName}`, text: `Check out this update from INWLab: ${eventName}`, url: window.location.href };
    try {
      if (navigator.share) await navigator.share(shareData);
      else { await navigator.clipboard.writeText(`${shareData.title}\n${shareData.url}`); alert('Link copied to clipboard!'); }
    } catch (err) {}
  }
}
