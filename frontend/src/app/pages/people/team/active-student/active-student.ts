import { Component, Input, Output, EventEmitter, OnChanges, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { CmsService } from '../../../../../services/cms.service';

interface Student { name: string; department: string; email: string; avatar?: string; }
declare var AOS: any;

@Component({ selector: 'app-active-student', standalone: true, imports: [CommonModule], templateUrl: './active-student.html' })
export class ActiveStudent implements OnInit, OnChanges {
  @Input() searchTerm: string = '';
  @Output() memberClick = new EventEmitter<any>(); // 🌟 新增

  allStudents: Student[] = [];
  filteredStudents: Student[] = [];

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
            if (parsed.students) {
              this.allStudents = parsed.students;
            }
            this.filterStudents();
          } catch(e) { console.error("Error parsing Students CMS", e); }
        },
        error: () => console.log('Using default Students data')
      });
    }
  }

  ngOnChanges() { this.filterStudents(); }

  filterStudents() {
    if (!this.searchTerm || this.searchTerm.trim() === '') { this.filteredStudents = [...this.allStudents]; return; }
    const term = this.searchTerm.toLowerCase();
    this.filteredStudents = this.allStudents.filter(s => s.name.toLowerCase().includes(term) || s.department.toLowerCase().includes(term) || s.email.toLowerCase().includes(term));
  }

  onMemberClick(student: Student) {
    this.memberClick.emit(student);
  }
}
