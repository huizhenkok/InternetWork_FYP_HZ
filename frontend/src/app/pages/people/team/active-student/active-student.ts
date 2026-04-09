import { Component, Input, OnChanges, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

interface Student { name: string; department: string; email: string; avatar?: string; }
declare var AOS: any;

@Component({ selector: 'app-active-student', standalone: true, imports: [CommonModule], templateUrl: './active-student.html' })
export class ActiveStudent implements OnInit, OnChanges {
  @Input() searchTerm: string = '';
  allStudents: Student[] = [];
  filteredStudents: Student[] = [];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      const savedTeam = localStorage.getItem('inwlab_cms_team');
      if (savedTeam) { const parsed = JSON.parse(savedTeam); if (parsed.students) { this.allStudents = parsed.students; } }
      this.filterStudents();
    }
  }
  ngOnChanges() { this.filterStudents(); }

  filterStudents() {
    if (!this.searchTerm || this.searchTerm.trim() === '') { this.filteredStudents = [...this.allStudents]; return; }
    const term = this.searchTerm.toLowerCase();
    this.filteredStudents = this.allStudents.filter(s => s.name.toLowerCase().includes(term) || s.department.toLowerCase().includes(term) || s.email.toLowerCase().includes(term));
  }
}
