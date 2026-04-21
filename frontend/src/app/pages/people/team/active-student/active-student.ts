import { Component, Input, Output, EventEmitter, OnChanges, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { AuthService } from '../../../../../services/auth.service';

interface Student { name: string; department: string; email: string; avatar?: string; bio?: string; focusAreas?: string[]; socialLink?: string; }
declare var AOS: any;

@Component({ selector: 'app-active-student', standalone: true, imports: [CommonModule], templateUrl: './active-student.html' })
export class ActiveStudent implements OnInit, OnChanges {
  @Input() searchTerm: string = '';
  @Output() memberClick = new EventEmitter<any>();

  allStudents: Student[] = [];
  filteredStudents: Student[] = [];

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
          const students = users.filter(u => u.role === 'Student' || u.role === 'UUM Student');
          this.allStudents = students.map(u => ({
            name: u.fullName,
            department: u.department || 'Postgraduate Student',
            email: u.email,
            socialLink: u.socialLink,
            avatar: u.avatar,
            bio: u.bio || u.researchInterests || 'Actively researching network protocols.',
            focusAreas: this.parseTags(u.focusAreas) // 🌟 使用解析器
          }));
          this.filterStudents();
        },
        error: (err) => console.error("Error loading students", err)
      });
    }
  }

  ngOnChanges() { this.filterStudents(); }

  filterStudents() {
    if (!this.searchTerm || this.searchTerm.trim() === '') { this.filteredStudents = [...this.allStudents]; return; }
    const term = this.searchTerm.toLowerCase();
    this.filteredStudents = this.allStudents.filter(s => s.name.toLowerCase().includes(term) || s.department.toLowerCase().includes(term) || s.email.toLowerCase().includes(term));
  }

  onMemberClick(student: Student) { this.memberClick.emit(student); }
}
