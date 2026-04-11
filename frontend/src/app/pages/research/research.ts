import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CmsService } from '../../../services/cms.service'; // 🌟 引入 CmsService

declare var AOS: any;

interface ResearchArea { id: string; title: string; desc: string; icon: string; link: string; }

@Component({
  selector: 'app-research',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './research.html'
})
export class Research implements OnInit {

  searchTerm: string = '';
  cmsData: any = { mainTitle: 'Research Areas', subTitle: 'Our laboratory focuses on critical advancements in network security, digital forensics, and intelligent systems. We bridge the gap between theoretical models and real-world application.' };

  allAreas: ResearchArea[] = [
    { id: 'cyber', title: 'Cybersecurity & Defense', desc: 'Advanced threat detection, penetration testing, and securing critical network infrastructures against modern cyber attacks.', icon: 'security', link: '/research/cybersecurity' },
    { id: 'forensics', title: 'Digital Forensics', desc: 'Recovery and investigation of material found in digital devices, focusing on cybercrime evidence analysis.', icon: 'manage_search', link: '/research/forensics' },
    { id: 'iot', title: 'IoT & Smart Systems', desc: 'Securing Internet of Things (IoT) ecosystems and developing resilient protocols for smart city infrastructures.', icon: 'router', link: '/research/iot' },
    { id: 'ai', title: 'Data Science & AI', desc: 'Leveraging machine learning algorithms for big data analysis, predictive modeling, and network anomaly detection.', icon: 'psychology', link: '/research/ai' },
    { id: 'cloud', title: 'Cloud Computing', desc: 'Optimizing virtualization technologies, container orchestration, and secure cloud storage architectures.', icon: 'cloud', link: '/research/cloud' },
    { id: 'network', title: 'Next-Gen Networking', desc: 'Research into 5G/6G technologies, software-defined networking (SDN), and edge computing solutions.', icon: 'cell_tower', link: '/research/network' }
  ];

  filteredAreas: ResearchArea[] = [];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private cmsService: CmsService // 🌟 注入 CmsService
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {

      // 🌟 核心修改：从真实数据库拉取 Research 数据
      this.cmsService.getCmsData('inwlab_cms_research').subscribe({
        next: (res: any) => {
          try {
            const parsed = JSON.parse(res.contentJson);
            this.cmsData.mainTitle = parsed.mainTitle || this.cmsData.mainTitle;
            this.cmsData.subTitle = parsed.subTitle || this.cmsData.subTitle;

            if (parsed.domains && parsed.domains.cyber && parsed.domains.cyber.title) {
              const d = parsed.domains;
              this.allAreas = [
                { id: 'cyber', title: d.cyber.title, desc: d.cyber.shortDesc, icon: 'security', link: '/research/cybersecurity' },
                { id: 'forensics', title: d.forensics.title, desc: d.forensics.shortDesc, icon: 'manage_search', link: '/research/forensics' },
                { id: 'iot', title: d.iot.title, desc: d.iot.shortDesc, icon: 'router', link: '/research/iot' },
                { id: 'ai', title: d.ai.title, desc: d.ai.shortDesc, icon: 'psychology', link: '/research/ai' },
                { id: 'cloud', title: d.cloud.title, desc: d.cloud.shortDesc, icon: 'cloud', link: '/research/cloud' },
                { id: 'network', title: d.network.title, desc: d.network.shortDesc, icon: 'cell_tower', link: '/research/network' }
              ];
            }
            this.filteredAreas = [...this.allAreas];
          } catch(e) { console.error("Error parsing Research CMS", e); }
        },
        error: () => {
          console.log('Using default Research data');
          this.filteredAreas = [...this.allAreas];
        }
      });

      setTimeout(() => {
        if (typeof AOS !== 'undefined') { AOS.init({ duration: 800, once: true, offset: 50 }); AOS.refreshHard(); window.scrollTo(0, 0); }
      }, 150);
    }
  }

  onSearch() {
    const term = this.searchTerm.toLowerCase();
    this.filteredAreas = this.allAreas.filter(area => area.title.toLowerCase().includes(term) || area.desc.toLowerCase().includes(term));
  }

  clearSearch() { this.searchTerm = ''; this.onSearch(); }

  get titleFirstPart(): string {
    const words = this.cmsData.mainTitle.trim().split(' ');
    if (words.length <= 1) return this.cmsData.mainTitle;
    return words.slice(0, -1).join(' ');
  }

  get titleLastPart(): string {
    const words = this.cmsData.mainTitle.trim().split(' ');
    if (words.length <= 1) return '';
    return words[words.length - 1];
  }
}
