import { Component, Input, OnChanges, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

interface AlumniMember { name: string; designation: string; organization: string; avatar?: string; }
interface AlumniYear { year: string; members: AlumniMember[]; }
declare var AOS: any;

@Component({ selector: 'app-alumni', standalone: true, imports: [CommonModule], templateUrl: './alumni.html' })
export class Alumni implements OnInit, OnChanges {
  @Input() searchTerm: string = '';
  allYears: AlumniYear[] = [];
  filteredYears: AlumniYear[] = [];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      const savedTeam = localStorage.getItem('inwlab_cms_team');
      if (savedTeam) { const parsed = JSON.parse(savedTeam); if (parsed.alumni) { this.allYears = parsed.alumni; } }
      this.filterAlumni();
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
