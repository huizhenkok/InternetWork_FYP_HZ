import { Component, Input, OnChanges, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

interface TeamMember { name: string; role: string; email?: string; socialLink?: string; avatar?: string; }
interface TeamSection { title: string; members: TeamMember[]; }

@Component({ selector: 'app-our-team', standalone: true, imports: [CommonModule], templateUrl: './our-team.html' })
export class OurTeam implements OnInit, OnChanges {
  @Input() searchTerm: string = '';
  allSections: TeamSection[] = [];
  filteredSections: TeamSection[] = [];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      const savedTeam = localStorage.getItem('inwlab_cms_team');
      if (savedTeam) { const parsed = JSON.parse(savedTeam); if (parsed.ourTeam) { this.allSections = parsed.ourTeam; } }
      this.filterMembers();
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
