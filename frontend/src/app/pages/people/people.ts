import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { CmsService } from '../../../services/cms.service'; // 🌟 引入 CmsService 获取标题

import { OurTeam } from './team/our-team/our-team';
import { ActiveStudent } from './team/active-student/active-student';
import { Alumni } from './team/alumni/alumni';

declare var AOS: any;

@Component({
  selector: 'app-people',
  standalone: true,
  imports: [CommonModule, FormsModule, OurTeam, ActiveStudent, Alumni],
  templateUrl: './people.html'
})
export class People implements OnInit {

  searchTerm: string = '';
  activeTab: string = 'Our Team';
  tabs: string[] = ['Our Team', 'Alumni', 'Student'];

  isModalOpen: boolean = false;
  selectedMember: any = null;

  // 🌟 Req 3: 绑定 CMS 的标题数据
  cmsData: any = {
    mainTitle: 'Leadership & Team',
    subTitle: 'A dedicated team of academic professionals, post-graduate researchers, and alumni advancing the field of network intelligence.'
  };

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private route: ActivatedRoute,
    private cmsService: CmsService // 🌟 注入
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {

      // 🌟 从数据库获取 Team 数据，并只保留 Header 信息
      this.cmsService.getCmsData('inwlab_cms_team').subscribe({
        next: (res: any) => {
          try {
            const parsed = JSON.parse(res.contentJson);
            if (parsed.mainTitle) this.cmsData.mainTitle = parsed.mainTitle;
            if (parsed.subTitle) this.cmsData.subTitle = parsed.subTitle;
          } catch(e) { console.error("Error parsing Team CMS", e); }
        }
      });

      this.route.queryParams.subscribe(params => {
        const tabParam = params['tab'];
        if (tabParam === 'alumni') { this.activeTab = 'Alumni'; }
        else if (tabParam === 'student') { this.activeTab = 'Student'; }
        else { this.activeTab = 'Our Team'; }

        setTimeout(() => { if (typeof AOS !== 'undefined') AOS.refreshHard(); }, 50);
      });

      setTimeout(() => {
        if (typeof AOS !== 'undefined') {
          AOS.init({ duration: 800, once: true, offset: 50 });
          AOS.refreshHard();
          window.scrollTo(0, 0);
        }
      }, 150);
    }
  }

  openMemberInfo(member: any) {
    this.selectedMember = member;
    this.isModalOpen = true;
    document.body.style.overflow = 'hidden';
  }

  closeModal() {
    this.isModalOpen = false;
    document.body.style.overflow = 'auto';
    setTimeout(() => { this.selectedMember = null; }, 300);
  }
}
