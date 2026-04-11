import { Component, Input, OnChanges, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { CmsService } from '../../../../../services/cms.service'; // 🌟 子组件跳 4 层

interface AlumniMember { name: string; designation: string; organization: string; avatar?: string; }
interface AlumniYear { year: string; members: AlumniMember[]; }
declare var AOS: any;

@Component({ selector: 'app-alumni', standalone: true, imports: [CommonModule], templateUrl: './alumni.html' })
export class Alumni implements OnInit, OnChanges {
  @Input() searchTerm: string = '';
  allYears: AlumniYear[] = [];
  filteredYears: AlumniYear[] = [];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private cmsService: CmsService // 🌟 注入 CmsService
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      // 🌟 核心修改：从 MySQL 获取 Alumni 数据
      this.cmsService.getCmsData('inwlab_cms_team').subscribe({
        next: (res: any) => {
          try {
            const parsed = JSON.parse(res.contentJson);
            if (parsed.alumni) {
              this.allYears = parsed.alumni;
            }
            this.filterAlumni(); // 🌟 数据拿到后再过滤渲染
          } catch(e) { console.error("Error parsing Alumni CMS", e); }
        },
        error: () => console.log('Using default Alumni data')
      });
    }
  }

  ngOnChanges() { this.filterAlumni(); }

  filterAlumni() {
    if (!this.searchTerm || this.searchTerm.trim() === '') { this.filteredYears = JSON.parse(JSON.stringify(this.allYears)); return; }
    const term = this.searchTerm.toLowerCase();
    this.filteredYears = this.allYears.map(yearGroup => {
      return { year: yearGroup.year, members: yearGroup.members.filter(m => m.name.toLowerCase().includes(term) || m.designation.toLowerCase().includes(term) || m.organization.toLowerCase().includes(term) || yearGroup.year.includes(term)) };
    }).filter(yearGroup => yearGroup.members.length > 0);
  }
}
