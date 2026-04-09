import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';

declare var AOS: any;

@Component({
  selector: 'app-resources',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './resources.html'
})
export class Resources implements OnInit {
  activeCategory: string = 'All';
  allResources: any[] = [];
  filteredResources: any[] = [];

  // 🌟 核心：为 CMS 数据提供默认值，防止由于没访问过 CMS 而报错
  cmsData: any = {
    mainTitle: 'Public Publications',
    subTitle: 'Explore research papers, datasets, and technical reports publicly shared by INWLab members.',
    filterTitle: 'Select a category to filter our repository of publications, reports, and datasets.'
  };

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {

      // 🌟 加载 CMS 里填写的文案
      const savedCms = localStorage.getItem('inwlab_cms_resource');
      if (savedCms) {
        try {
          const parsed = JSON.parse(savedCms);
          this.cmsData.mainTitle = parsed.mainTitle || this.cmsData.mainTitle;
          this.cmsData.subTitle = parsed.subTitle || this.cmsData.subTitle;
          this.cmsData.filterTitle = parsed.filterTitle || this.cmsData.filterTitle;
        } catch(e) {}
      }

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
          let category = 'Cybersecurity';
          const titleLower = doc.fileName.toLowerCase();
          if (titleLower.includes('ai') || titleLower.includes('machine learning')) category = 'AI / ML';
          if (titleLower.includes('network') || titleLower.includes('iot') || titleLower.includes('5g')) category = 'Network Protocol';
          if (titleLower.includes('data') || titleLower.includes('dataset')) category = 'Datasets';

          return {
            category: category,
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

      this.setCategory('All');
    }
  }

  setCategory(category: string) {
    this.activeCategory = category;
    if (category === 'All') {
      this.filteredResources = this.allResources;
    } else {
      this.filteredResources = this.allResources.filter(res => res.category === category);
    }
  }

  handleAction(actionType: string, title: string) {
    if (actionType === 'Download') {
      alert(`Initiating secure download for: ${title}`);
    } else {
      alert(`Viewing metadata details for: ${title}`);
    }
  }

  // 🌟 和 Research 一样的智能拆分文字函数，用来保留渐变色彩效果
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
