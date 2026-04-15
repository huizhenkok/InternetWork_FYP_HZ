import { Component, Input, Output, EventEmitter, OnChanges, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { CmsService } from '../../../../../services/cms.service';

interface AlumniMember { name: string; designation: string; organization: string; avatar?: string; }
interface AlumniYear { year: string; members: AlumniMember[]; }
declare var AOS: any;

@Component({ selector: 'app-alumni', standalone: true, imports: [CommonModule], templateUrl: './alumni.html' })
export class Alumni implements OnInit, OnChanges {
  @Input() searchTerm: string = '';
  @Output() memberClick = new EventEmitter<any>(); // 🌟 新增

  allYears: AlumniYear[] = [];
  filteredYears: AlumniYear[] = [];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private cmsService: CmsService
  ) {}

  // 🌟 全局统一的图片修复逻辑
  public fixUrl(url: string | undefined): string {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url.replace('http://localhost:8080', 'https://internetworks.my');
    }
    return url.startsWith('/') ? `https://internetworks.my${url}` : `https://internetworks.my/${url}`;
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.cmsService.getCmsData('inwlab_cms_team').subscribe({
        next: (res: any) => {
          try {
            const parsed = JSON.parse(res.contentJson);
            if (parsed.alumni) {
              this.allYears = parsed.alumni;
            }
            this.filterAlumni();
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

  onMemberClick(member: AlumniMember) {
    this.memberClick.emit(member);
  }
}
