import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

declare var AOS: any;

@Component({
  selector: 'app-news',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './news.html'
})
export class News implements OnInit {

  activeTab: string = 'UPCOMING';

  // 🌟 默认数据，如果 CMS 里没数据就显示这些
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

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {

      // 🌟 核心：拉取 CMS 数据
      const savedCms = localStorage.getItem('inwlab_cms_news_events');
      if (savedCms) {
        try {
          const parsed = JSON.parse(savedCms);
          // 深度合并对象，防止遗漏字段
          this.cmsData = { ...this.cmsData, ...parsed };
        } catch(e) { console.error(e); }
      }

      setTimeout(() => {
        if (typeof AOS !== 'undefined') {
          AOS.init({ duration: 800, once: true, offset: 50 });
          AOS.refreshHard();
          window.scrollTo(0, 0);
        }
      }, 150);
    }
  }

  setTab(tab: string) {
    this.activeTab = tab;
    setTimeout(() => {
      if (typeof AOS !== 'undefined') AOS.refreshHard();
    }, 100);
  }

  handleRSVP(eventName: string) {
    alert(`Registration for "${eventName}" will open shortly.\nPlease check back later or contact the lab administration.`);
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
