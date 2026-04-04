import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

// 🌟 引入我们刚才创建的 5 个子组件
import { OurTeam } from './team/our-team/our-team';
import { Directory } from './team/directory/directory';
import { ActiveStudent } from './team/active-student/active-student';
import { Alumni } from './team/alumni/alumni';
import { ConferenceTeam } from './team/conference-team/conference-team';

declare var AOS: any;

@Component({
  selector: 'app-people',
  standalone: true,
  // 🌟 确保所有子组件都被注册进了 imports 数组
  imports: [CommonModule, RouterLink, FormsModule, OurTeam, Directory, ActiveStudent, Alumni, ConferenceTeam],
  templateUrl: './people.html'
})
export class People implements OnInit {

  searchTerm: string = '';
  // 默认显示的分类页面
  activeTab: string = 'Our Team';

  // 定义所有可用的标签页
  tabs: string[] = ['Our Team', 'Directory of Expert', 'Active Student', 'Alumni', 'Conference Team'];

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

  // 切换标签页的方法
  setTab(tab: string) {
    this.activeTab = tab;
    // 每次切换时清空搜索词，体验更好
    this.searchTerm = '';
    // 切换标签时强行刷新动画
    setTimeout(() => {
      if (typeof AOS !== 'undefined') AOS.refreshHard();
    }, 50);
  }
}
