import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RsvpService } from '../../../services/rsvp.service';
import { CmsService } from '../../../services/cms.service'; // 🌟 Added CmsService

declare var AOS: any;

@Component({
  selector: 'app-news',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './news.html'
})
export class News implements OnInit {

  // Default data fallback if CMS data is missing
  cmsData: any = {
    mainTitle: 'NEWS',
    mainTitleHighlight: '& EVENTS',
    subTitle: 'Stay synchronized with our latest research breakthroughs, lab upgrades, and upcoming academic gatherings.',
    flagship: {
      badge: 'Flagship Event', date: 'NOV 6-7, 2026', location: 'ALOR SETAR',
      title: 'NETAPPS 2026 Summit', desc: 'Join us for an immersive discussion on the next horizon of decentralized protocols and network defense strategies.', icon: 'hub'
    },
    gatheringsTitle: 'INCOMING GATHERINGS',
    gatherings: [
      { date: 'NOV 12', location: 'LAB A', title: 'Cyber Forensics Workshop', desc: 'Advanced techniques in digital evidence recovery and analysis for next-gen networks.', icon: 'security' },
      { date: 'DEC 05', location: 'VIRTUAL', title: 'PhD Thesis Defense: AI Ethics', desc: 'Defending the framework for ethical decision making in autonomous network agents.', icon: 'psychology' }
    ],
    quickUpdatesTitle: 'QUICK UPDATES',
    quickUpdates: [
      { tag: 'NEXT WEEK', text: 'Lab server maintenance scheduled.' },
      { tag: 'REMINDER', text: 'Call for papers deadline extended to Nov 1.' }
    ],
    quoteText: '"Innovation in networking is not just about speed, but securing the foundation of tomorrow\'s digital society."',
    quoteAuthor: 'INWLab Vision'
  };

  isRsvpModalOpen: boolean = false;
  rsvpEventName: string = '';
  isSubmittingRsvp: boolean = false;
  isRsvpSuccess: boolean = false;

  rsvpData = {
    name: '',
    email: '',
    role: 'UUM Student',
    message: ''
  };

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private rsvpService: RsvpService,
    private cmsService: CmsService // 🌟 Inject CmsService
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {

      // Core modification: Fetch News CMS data from MySQL
      this.cmsService.getCmsData('inwlab_cms_news_events').subscribe({
        next: (res: any) => {
          try {
            const parsed = JSON.parse(res.contentJson);
            this.cmsData = { ...this.cmsData, ...parsed };
          } catch(e) { console.error("Error parsing News CMS", e); }
        },
        error: () => console.log('Using default News data')
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

  closeRsvpModal() {
    this.isRsvpModalOpen = false;
  }

  submitRSVP() {
    if (!this.rsvpData.name || !this.rsvpData.email) {
      alert("Please fill in your Name and Email address.");
      return;
    }

    this.isSubmittingRsvp = true;

    // Data payload must match Spring Boot EventRsvp.java fields
    const payload = {
      eventName: this.rsvpEventName,
      name: this.rsvpData.name,
      email: this.rsvpData.email,
      role: this.rsvpData.role,
      message: this.rsvpData.message
    };

    // Call RsvpService to send real HTTP POST request
    this.rsvpService.submitRsvp(payload).subscribe({
      next: (response: any) => {
        this.isSubmittingRsvp = false;
        this.isRsvpSuccess = true;

        // Delay modal close and clear form on success
        setTimeout(() => {
          this.closeRsvpModal();
          this.rsvpData = { name: '', email: '', role: 'UUM Student', message: '' };
        }, 2000);
      },
      error: (err: any) => {
        this.isSubmittingRsvp = false;
        console.error("RSVP Error:", err);
        alert("Failed to submit RSVP. Please try again.");
      }
    });
  }

  async shareEvent(eventName: string) {
    const shareData = {
      title: `INWLab Event: ${eventName}`,
      text: `Check out this upcoming event at INWLab: ${eventName}`,
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(`${shareData.title}\n${shareData.url}`);
        alert('Event link copied to clipboard! You can now paste it anywhere to share.');
      }
    } catch (err) {
      console.log('Error sharing:', err);
    }
  }
}
