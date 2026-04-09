import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

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
  filters: string[] = ['Most Recent']; // 🌟 核心修改：只保留 Most Recent

  allThreads: any[] = [];
  filteredThreads: any[] = [];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.loadForumData();
      setTimeout(() => {
        if (typeof AOS !== 'undefined') {
          AOS.init({ duration: 800, once: true, offset: 50 });
          AOS.refreshHard();
          window.scrollTo(0, 0);
        }
      }, 150);
    }
  }

  loadForumData() {
    const savedTopics = localStorage.getItem('inwlab_forum_topics');
    if (savedTopics) {
      this.allThreads = JSON.parse(savedTopics);
    }

    // 🌟 如果 CMS 数据库是空的，自动填充默认的学术讨论数据，防止白屏
    if (!this.allThreads || this.allThreads.length === 0) {
      this.allThreads = [
        {
          id: 'zkp-iot-networks',
          title: 'Discussion: Implementing Zero-Knowledge Proofs in IoT Networks',
          authorName: 'Prof. Alan Turing',
          role: 'FACULTY',
          tag: 'Cryptography',
          timeAgo: '2 hours ago',
          content: 'I\'ve been working on reducing computational overhead on edge devices for secure communications. Does anyone see potential optimizations for memory usage?',
          views: '342 views',
          isOfficial: true,
          icon: 'lock',
          replies: [
            {
              id: 1,
              authorName: 'Sarah_PhD',
              role: 'STUDENT',
              timeAgo: '1 hr ago',
              content: 'I tried this implementation on the Raspberry Pi cluster, but latency increased by 15% compared to the standard library. We might need to prune the hash tree.',
              icon: 'school'
            }
          ]
        },
        {
          id: 'sdn-routing-optimization',
          authorName: 'Dr_Network',
          role: 'ALUMNI',
          tag: 'SDN',
          timeAgo: '1 day ago',
          title: 'Paper Review: Machine Learning for SDN Routing',
          content: 'Just published our recent findings on applying Reinforcement Learning to optimize packet routing in Software-Defined Networks. The dataset is attached below.',
          views: '1.2k views',
          isOfficial: false,
          icon: 'route',
          replies: []
        }
      ];
      localStorage.setItem('inwlab_forum_topics', JSON.stringify(this.allThreads));
    }

    this.applyFilters();
  }

  setFilter(filter: string) {
    this.activeFilter = filter;
    this.applyFilters();
  }

  applyFilters() {
    const term = this.searchTerm.toLowerCase().trim();

    this.filteredThreads = this.allThreads.filter(thread => {
      if (!term) return true;
      return thread.title.toLowerCase().includes(term) ||
        thread.authorName.toLowerCase().includes(term) ||
        thread.tag.toLowerCase().includes(term) ||
        thread.content.toLowerCase().includes(term);
    });

    setTimeout(() => {
      if (typeof AOS !== 'undefined') AOS.refreshHard();
    }, 50);
  }
}
