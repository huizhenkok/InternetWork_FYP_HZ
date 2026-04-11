import { Component, Input, OnChanges, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { CmsService } from '../../../../../services/cms.service'; // 🌟 子组件跳 4 层

interface TeamMember { name: string; role: string; email?: string; socialLink?: string; avatar?: string; }
interface TeamSection { title: string; members: TeamMember[]; }

@Component({ selector: 'app-our-team', standalone: true, imports: [CommonModule], templateUrl: './our-team.html' })
export class OurTeam implements OnInit, OnChanges {
  @Input() searchTerm: string = '';
  allSections: TeamSection[] = [];
  filteredSections: TeamSection[] = [];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private cmsService: CmsService // 🌟 注入 CmsService
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      // 🌟 核心修改：从 MySQL 获取 Team 数据
      this.cmsService.getCmsData('inwlab_cms_team').subscribe({
        next: (res: any) => {
          try {
            const parsed = JSON.parse(res.contentJson);
            if (parsed.ourTeam) {
              this.allSections = parsed.ourTeam;
            }
            this.filterMembers(); // 🌟 数据拿到后再过滤渲染
          } catch(e) { console.error("Error parsing Our Team CMS", e); }
        },
        error: () => console.log('Using default Our Team data')
      });
    }
  }

  ngOnChanges() { this.filterMembers(); }

  filterMembers() {
    if (!this.searchTerm || this.searchTerm.trim() === '') { this.filteredSections = JSON.parse(JSON.stringify(this.allSections)); return; }
    const term = this.searchTerm.toLowerCase();
    this.filteredSections = this.allSections.map(section => {
      return { title: section.title, members: section.members.filter(m => m.name.toLowerCase().includes(term) || m.role.toLowerCase().includes(term)) };
    }).filter(section => section.members.length > 0);
  }
}
