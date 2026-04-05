import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms'; // 🌟 引入表单模块以支持双向搜索

declare var AOS: any;

interface ForumThread {
  id: string;
  author: string;
  role: string;
  tag: string;
  timeAgo: string;
  title: string;
  excerpt: string;
  views: string;
  category: string; // 'Most Recent' | 'Top Rated' | 'Trending'
  isOfficial: boolean;
  icon: string;
}

@Component({
  selector: 'app-forum',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './forum.html'
})
export class Forum implements OnInit {
  searchTerm: string = '';
  activeFilter: string = 'Most Recent';
  filters: string[] = ['Most Recent', 'Top Rated', 'Trending'];

  // 🌟 UUM 专属的贴切数据
  allThreads: ForumThread[] = [
    {
      id: 'uum-wifi-upgrade',
      author: '@UUM_IT_Admin',
      role: 'Lab Admin',
      tag: 'Official',
      timeAgo: '2 hours ago',
      title: 'Notice: SOC Server Maintenance & UUM-WiFi Upgrade',
      excerpt: 'Scheduled downtime for the School of Computing data center. UUM-WiFi in the INWLab will be intermittently affected from 2AM to 4AM this weekend.',
      views: '1.2k views',
      category: 'Most Recent',
      isOfficial: true,
      icon: 'campaign'
    },
    {
      id: 'netapps-2024-latex',
      author: '@Dr_Alex',
      role: 'Tech Lead',
      tag: 'Conference',
      timeAgo: '5 hours ago',
      title: 'NETAPPS 2024: IEEE Paper LaTeX & Word Formatting Guidelines',
      excerpt: 'For those from UUM submitting to NETAPPS this November, here are the common formatting issues encountered and how to fix them in your templates.',
      views: '850 views',
      category: 'Trending',
      isOfficial: false,
      icon: 'code'
    },
    {
      id: 'iot-equipment-booking',
      author: '@Postgrad_Ahmad',
      role: 'MSc Student',
      tag: 'General',
      timeAgo: '1 day ago',
      title: 'Booking IoT Sensors at Awang Had Salleh Graduate School',
      excerpt: 'Verified procedures for booking and utilizing the high-fidelity environmental sensors for master and PhD thesis experiments.',
      views: '3.4k views',
      category: 'Top Rated',
      isOfficial: false,
      icon: 'school'
    },
    {
      id: 'smart-campus-dataset',
      author: '@Data_Scientist_01',
      role: 'Researcher',
      tag: 'Dataset',
      timeAgo: '2 days ago',
      title: 'Released: UUM Sintok Smart Campus Traffic Dataset (2023)',
      excerpt: 'We have just published the anonymized network traffic dataset captured across Sintok campus for ML-based intrusion detection research.',
      views: '5.6k views',
      category: 'Top Rated',
      isOfficial: false,
      icon: 'database'
    }
  ];

  filteredThreads: ForumThread[] = [];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    this.applyFilters();
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        if (typeof AOS !== 'undefined') {
          AOS.init({ duration: 800, once: true, offset: 50 });
          AOS.refreshHard();
          window.scrollTo(0, 0);
        }
      }, 150);
    }
  }

  setFilter(filter: string) {
    this.activeFilter = filter;
    this.applyFilters();
  }

  // 🌟 全新升级的超级搜索与过滤逻辑
  applyFilters() {
    const term = this.searchTerm.toLowerCase().trim();

    this.filteredThreads = this.allThreads.filter(thread => {
      // 1. 🌟 关键修改：如果搜索框里有字，就进行“全局搜索”（无视当前分类）
      //    如果搜索框是空的，才严格按照当前点击的按钮（Most Recent/Top Rated等）来显示
      const matchCategory = term ? true : thread.category === this.activeFilter;

      // 2. 🌟 扩展搜索范围：现在可以搜标题、作者、标签，甚至是帖子摘要（excerpt）里的内容！
      const matchSearch = !term ||
        thread.title.toLowerCase().includes(term) ||
        thread.author.toLowerCase().includes(term) ||
        thread.tag.toLowerCase().includes(term) ||
        thread.excerpt.toLowerCase().includes(term);

      return matchCategory && matchSearch;
    });

    // 重新触发动画，让搜索结果顺滑地飘出来
    setTimeout(() => {
      if (typeof AOS !== 'undefined') AOS.refreshHard();
    }, 50);
  }
}
