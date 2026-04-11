import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CmsService } from '../../../services/cms.service'; // 🌟 引入 CmsService

declare var AOS: any;

@Component({
  selector: 'app-resources',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './resources.html'
})
export class Resources implements OnInit {

  allResources: any[] = [];

  cmsData: any = {
    mainTitle: 'Public Publications',
    subTitle: 'Explore research papers, datasets, and technical reports publicly shared by INWLab members.',
    filterTitle: 'Repository of publications, reports, and datasets.'
  };

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private cmsService: CmsService // 🌟 注入 CmsService
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {

      // 🌟 核心修改：从 MySQL 获取 Resource 文案数据
      this.cmsService.getCmsData('inwlab_cms_resource').subscribe({
        next: (res: any) => {
          try {
            const parsed = JSON.parse(res.contentJson);
            this.cmsData.mainTitle = parsed.mainTitle || this.cmsData.mainTitle;
            this.cmsData.subTitle = parsed.subTitle || this.cmsData.subTitle;
            this.cmsData.filterTitle = parsed.filterTitle || this.cmsData.filterTitle;
          } catch(e) { console.error("Error parsing Resource CMS", e); }
        },
        error: () => console.log('Using default Resource data')
      });

      this.loadRealPublications();

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

  loadRealPublications() {
    if (isPlatformBrowser(this.platformId)) {
      const allImports = JSON.parse(localStorage.getItem('inwlab_publications') || '[]');

      this.allResources = allImports
        .filter((doc: any) => doc.visibility === 'Public')
        .sort((a: any, b: any) => b.timestamp - a.timestamp)
        .map((doc: any) => {
          return {
            type: 'Publication',
            typeClass: 'bg-primary/10 border-primary/20 text-primary dark:bg-accent-teal/20 dark:border-accent-teal/30 dark:text-accent-teal',
            date: doc.dateStr.split(' ')[0],
            title: doc.fileName,
            authors: `${doc.authorName} (${doc.authorRole})`,
            desc: `This document was uploaded and made public by ${doc.authorName} on ${doc.dateStr}. It is part of the INWLab secure archive.`,
            primaryBtnText: 'Download',
            primaryBtnIcon: 'download',
            secondaryBtnText: 'View Details',
            secondaryBtnIcon: 'info'
          };
        });
    }
  }

  handleAction(actionType: string, title: string) {
    if (actionType === 'Download') {
      alert(`Initiating secure download for: ${title}`);
    } else {
      alert(`Viewing metadata details for: ${title}`);
    }
  }

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
