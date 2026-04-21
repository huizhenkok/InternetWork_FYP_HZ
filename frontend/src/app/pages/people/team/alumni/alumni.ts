import { Component, Input, Output, EventEmitter, OnChanges, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AuthService } from '../../../../../services/auth.service';

interface AlumniMember { name: string; designation: string; organization: string; avatar?: string; email?: string; bio?: string; focusAreas?: string[]; socialLink?: string; }
interface AlumniYear { year: string; members: AlumniMember[]; }

@Component({ selector: 'app-alumni', standalone: true, imports: [CommonModule], templateUrl: './alumni.html' })
export class Alumni implements OnInit, OnChanges {
  @Input() searchTerm: string = '';
  @Output() memberClick = new EventEmitter<any>();

  allYears: AlumniYear[] = [];
  filteredYears: AlumniYear[] = [];

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private authService: AuthService) {}

  public fixUrl(url: string | undefined): string {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url.replace('http://localhost:8080', 'https://internetworks.my');
    return url.startsWith('/') ? `https://internetworks.my${url}` : `https://internetworks.my/${url}`;
  }

  // 🌟 核心修复：添加解析器
  private parseTags(tags: any): string[] {
    if (Array.isArray(tags)) return tags;
    if (typeof tags === 'string') {
      try { const parsed = JSON.parse(tags); return Array.isArray(parsed) ? parsed : []; }
      catch(e) { return []; }
    }
    return [];
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.authService.getAllUsers().subscribe({
        next: (users: any[]) => {
          const alumni = users.filter(u => u.role === 'Alumni');
          const grouped = alumni.reduce((acc: any, u: any) => {
            const groupName = u.department || 'Alumni Network';
            if (!acc[groupName]) acc[groupName] = [];
            acc[groupName].push({
              name: u.fullName,
              designation: u.jobTitle || 'Industry Professional',
              organization: u.company || 'Independent',
              email: u.email,
              socialLink: u.socialLink,
              avatar: u.avatar,
              bio: u.bio || u.researchInterests || 'Proud member of INWLab Alumni.',
              focusAreas: this.parseTags(u.focusAreas) // 🌟 使用解析器
            });
            return acc;
          }, {});

          this.allYears = Object.keys(grouped).map(key => ({ year: key, members: grouped[key] }));
          this.filterAlumni();
        },
        error: (err) => console.error("Error loading alumni", err)
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

  onMemberClick(member: AlumniMember) { this.memberClick.emit(member); }
}
