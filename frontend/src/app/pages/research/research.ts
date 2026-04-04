import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms'; // 🌟 引入表单模块，激活双向绑定

declare var AOS: any;

// 🌟 定义卡片的数据结构
interface ResearchArea {
  id: string;
  title: string;
  desc: string;
  icon: string;
  link: string;
}

@Component({
  selector: 'app-research',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule], // 🌟 装载 FormsModule
  templateUrl: './research.html'
})
export class Research implements OnInit {

  searchTerm: string = ''; // 绑定的搜索词

  // 🌟 这里是我们的“虚拟数据库” (无需后端！)
  allAreas: ResearchArea[] = [
    { id: 'cyber', title: 'Cybersecurity & Defense', desc: 'Advanced threat detection, penetration testing, and securing critical network infrastructures against modern cyber attacks.', icon: 'security', link: '/research/cybersecurity' },
    { id: 'forensics', title: 'Digital Forensics', desc: 'Recovery and investigation of material found in digital devices, focusing on cybercrime evidence analysis.', icon: 'manage_search', link: '/research/forensics' },
    { id: 'iot', title: 'IoT & Smart Systems', desc: 'Securing Internet of Things (IoT) ecosystems and developing resilient protocols for smart city infrastructures.', icon: 'router', link: '/research/iot' },
    { id: 'ai', title: 'Data Science & AI', desc: 'Leveraging machine learning algorithms for big data analysis, predictive modeling, and network anomaly detection.', icon: 'psychology', link: '/research/ai' },
    { id: 'cloud', title: 'Cloud Computing', desc: 'Optimizing virtualization technologies, container orchestration, and secure cloud storage architectures.', icon: 'cloud', link: '/research/cloud' },
    { id: 'network', title: 'Next-Gen Networking', desc: 'Research into 5G/6G technologies, software-defined networking (SDN), and edge computing solutions.', icon: 'cell_tower', link: '/research/network' }
  ];

  // 当前显示在页面上的数组（一开始等于全部）
  filteredAreas: ResearchArea[] = [...this.allAreas];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
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

  // 🌟 实时搜索过滤魔法
  onSearch() {
    const term = this.searchTerm.toLowerCase();
    this.filteredAreas = this.allAreas.filter(area =>
      area.title.toLowerCase().includes(term) ||
      area.desc.toLowerCase().includes(term)
    );
    // 每次搜索后刷新一下动画
    setTimeout(() => {
      if (typeof AOS !== 'undefined') AOS.refresh();
    }, 50);
  }

  // 🌟 Filter 按钮：目前我们先让它充当“重置/清除”搜索的功能
  clearSearch() {
    this.searchTerm = '';
    this.onSearch();
  }
}
