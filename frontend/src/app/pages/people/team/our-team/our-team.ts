import { Component, Input, Output, EventEmitter, OnChanges, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AuthService } from '../../../../../services/auth.service';

interface TeamMember { name: string; role: string; email?: string; socialLink?: string; avatar?: string; bio?: string; focusAreas?: string[]; }
interface TeamSection { title: string; members: TeamMember[]; }

@Component({ selector: 'app-our-team', standalone: true, imports: [CommonModule], templateUrl: './our-team.html' })
export class OurTeam implements OnInit, OnChanges {
  @Input() searchTerm: string = '';
  @Output() memberClick = new EventEmitter<any>();

  allSections: TeamSection[] = [];
  filteredSections: TeamSection[] = [];

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private authService: AuthService) {}

  public fixUrl(url: string | undefined): string {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url.replace('http://localhost:8080', 'https://internetworks.my');
    return url.startsWith('/') ? `https://internetworks.my${url}` : `https://internetworks.my/${url}`;
  }

  // 🌟 核心修复：把数据库里的字符串标签洗成真正的数组
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
          const members = users.filter(u => u.role === 'Faculty'); // Admin 依旧隐藏
          const grouped = members.reduce((acc: any, u: any) => {
            const dept = u.department || 'Core Research Team';
            if (!acc[dept]) acc[dept] = [];
            acc[dept].push({
              name: u.fullName,
              role: u.jobTitle || 'Senior Researcher',
              email: u.email,
              socialLink: u.socialLink,
              avatar: u.avatar,
              bio: u.bio || u.researchInterests || 'Focusing on advanced InterNetWorks technologies.',
              focusAreas: this.parseTags(u.focusAreas) // 🌟 使用解析器
            });
            return acc;
          }, {});

          this.allSections = Object.keys(grouped).map(key => ({ title: key, members: grouped[key] }));
          this.filterMembers();
        },
        error: (err) => console.error('Failed to load users from DB', err)
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

  onMemberClick(member: TeamMember) { this.memberClick.emit(member); }
}
