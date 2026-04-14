import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CmsService } from '../../../services/cms.service';

declare var AOS: any;

@Component({
  selector: 'app-forum',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './forum.html'
})
export class Forum implements OnInit {
  searchTerm: string = '';
  activeFilter: string = 'Most Recent';
  filters: string[] = ['Most Recent'];
  allThreads: any[] = [];
  filteredThreads: any[] = [];
  isLoading: boolean = true; // 🌟 增加加载状态

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private cmsService: CmsService
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadForumData();
    }
  }

  loadForumData() {
    this.isLoading = true;
    this.cmsService.getCmsData('inwlab_forum_topics').subscribe({
      next: (res: any) => {
        try {
          this.allThreads = JSON.parse(res.contentJson);
          if (!this.allThreads || this.allThreads.length === 0) this.applyDefaultForumData();
        } catch(e) { this.applyDefaultForumData(); }
        this.finishLoading();
      },
      error: () => { this.applyDefaultForumData(); this.finishLoading(); }
    });
  }

  finishLoading() {
    this.applyFilters();
    this.isLoading = false;
    setTimeout(() => { if (typeof AOS !== 'undefined') { AOS.init({ duration: 800, once: true, offset: 50 }); AOS.refreshHard(); window.scrollTo(0, 0); } }, 150);
  }

  applyDefaultForumData() {
    this.allThreads = [
      { id: 'zkp-iot-networks', title: 'Discussion: Implementing Zero-Knowledge Proofs in IoT Networks', authorName: 'Prof. Alan Turing', role: 'FACULTY', tag: 'Cryptography', timeAgo: '2 hours ago', content: 'I\'ve been working on reducing computational overhead...', views: '342 views', isOfficial: true, icon: 'lock', replies: [] }
    ];
  }

  setFilter(filter: string) { this.activeFilter = filter; this.applyFilters(); }

  applyFilters() {
    const term = this.searchTerm.toLowerCase().trim();
    this.filteredThreads = this.allThreads.filter(thread => {
      if (!term) return true;
      return thread.title.toLowerCase().includes(term) || thread.authorName.toLowerCase().includes(term) || thread.tag.toLowerCase().includes(term) || thread.content.toLowerCase().includes(term);
    });
    setTimeout(() => { if (typeof AOS !== 'undefined') AOS.refreshHard(); }, 50);
  }
}
