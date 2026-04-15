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
  isLoading: boolean = true;

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
          // 🌟 修复：如果解析出来为空，就老老实实是个空数组，不要再塞假数据了
          if (!this.allThreads) this.allThreads = [];
        } catch(e) {
          this.allThreads = [];
        }
        this.finishLoading();
      },
      error: () => {
        this.allThreads = [];
        this.finishLoading();
      }
    });
  }

  finishLoading() {
    this.applyFilters();
    this.isLoading = false;
    setTimeout(() => { if (typeof AOS !== 'undefined') { AOS.init({ duration: 800, once: true, offset: 50 }); AOS.refreshHard(); window.scrollTo(0, 0); } }, 150);
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
