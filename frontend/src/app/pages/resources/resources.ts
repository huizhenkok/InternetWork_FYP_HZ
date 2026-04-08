import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router'; // 🌟 核心修复：改为引入全面的 RouterModule

declare var AOS: any;

@Component({
  selector: 'app-resources',
  standalone: true,
  imports: [CommonModule, RouterModule], // 🌟 核心修复：在这里注入 RouterModule
  templateUrl: './resources.html'
})
export class Resources implements OnInit {
  activeCategory: string = 'All';
  allResources: any[] = [];
  filteredResources: any[] = [];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
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
}
