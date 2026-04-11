import { Component, Input, OnChanges, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { CmsService } from '../../../../../services/cms.service'; // 🌟 子组件跳 4 层

interface Student { name: string; department: string; email: string; avatar?: string; }
declare var AOS: any;

@Component({ selector: 'app-active-student', standalone: true, imports: [CommonModule], templateUrl: './active-student.html' })
export class ActiveStudent implements OnInit, OnChanges {
  @Input() searchTerm: string = '';
  allStudents: Student[] = [];
  filteredStudents: Student[] = [];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private cmsService: CmsService // 🌟 注入 CmsService
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      // 🌟 核心修改：从 MySQL 获取 Students 数据
      this.cmsService.getCmsData('inwlab_cms_team').subscribe({
        next: (res: any) => {
          try {
            const parsed = JSON.parse(res.contentJson);
            if (parsed.students) {
              this.allStudents = parsed.students;
            }
            this.filterStudents(); // 🌟 数据拿到后再过滤渲染
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
}
