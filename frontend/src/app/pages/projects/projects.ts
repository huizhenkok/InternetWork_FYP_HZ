import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { CmsService } from '../../../services/cms.service'; // 🌟 引入 CmsService

declare var AOS: any;

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './projects.html'
})
export class Projects implements OnInit {
  projectList: any[] = [];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private cmsService: CmsService // 🌟 注入 CmsService
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {

      // 🌟 核心修改：从 MySQL 获取 Resource 数据，然后提取其中的 projects 数组
      this.cmsService.getCmsData('inwlab_cms_resource').subscribe({
        next: (res: any) => {
          try {
            const parsed = JSON.parse(res.contentJson);
            if (parsed.projects && parsed.projects.length > 0) {
              this.projectList = parsed.projects;
            } else {
              this.loadDefaultProjects();
            }
          } catch(e) {
            console.error("Error parsing Projects CMS", e);
            this.loadDefaultProjects();
          }
        },
        error: () => this.loadDefaultProjects()
      });

      setTimeout(() => {
        if (typeof AOS !== 'undefined') { AOS.init({ duration: 800, once: true }); }
      }, 100);
    }
  }

  loadDefaultProjects() {
    this.projectList = [
      { id: 1, title: 'Quantum Encryption Protocols', name: 'Dr. Aris Thorne', date: '2026-03-15', summary: 'Developing unbreakable communication lines using quantum entanglement mechanics for next-gen IoT networks.' },
      { id: 2, title: 'AI-Driven Threat Detection', name: 'Sarah Jenkins', date: '2026-04-02', summary: 'A machine learning model that analyzes network traffic behavior to instantly identify and quarantine zero-day malware attacks.' }
    ];
  }
}
