import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';

// 引入 3 个子组件
import { OurTeam } from './team/our-team/our-team';
import { ActiveStudent } from './team/active-student/active-student';
import { Alumni } from './team/alumni/alumni';

declare var AOS: any;

@Component({
  selector: 'app-people',
  standalone: true,
  // 🚨 移除了 RouterLink，消除 NG8113 警告
  imports: [CommonModule, FormsModule, OurTeam, ActiveStudent, Alumni],
  templateUrl: './people.html'
})
export class People implements OnInit {

  searchTerm: string = '';
  activeTab: string = 'Our Team';
  tabs: string[] = ['Our Team', 'Alumni', 'Student'];

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

  setTab(tab: string) {
    this.activeTab = tab;
    this.searchTerm = '';
    setTimeout(() => {
      if (typeof AOS !== 'undefined') AOS.refreshHard();
    }, 50);
  }
}
