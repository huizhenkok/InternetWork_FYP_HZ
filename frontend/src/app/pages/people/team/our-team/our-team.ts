import { Component, Input, Output, EventEmitter, OnChanges, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { CmsService } from '../../../../../services/cms.service';

interface TeamMember { name: string; role: string; email?: string; socialLink?: string; avatar?: string; }
interface TeamSection { title: string; members: TeamMember[]; }

@Component({ selector: 'app-our-team', standalone: true, imports: [CommonModule], templateUrl: './our-team.html' })
export class OurTeam implements OnInit, OnChanges {
  @Input() searchTerm: string = '';
  @Output() memberClick = new EventEmitter<any>(); // 🌟 新增：发射点击信号

  allSections: TeamSection[] = [];
  filteredSections: TeamSection[] = [];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private cmsService: CmsService
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.cmsService.getCmsData('inwlab_cms_team').subscribe({
        next: (res: any) => {
          try {
            const parsed = JSON.parse(res.contentJson);
            if (parsed.ourTeam) {
              this.allSections = parsed.ourTeam;
            }
            this.filterMembers();
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

  // 🌟 新增：触发点击事件
  onMemberClick(member: TeamMember) {
    this.memberClick.emit(member);
  }
}
