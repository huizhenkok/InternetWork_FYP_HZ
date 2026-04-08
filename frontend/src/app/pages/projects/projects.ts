import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
declare var AOS: any;

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './projects.html'
})
export class Projects implements OnInit {
  projectList: any[] = [];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      // 读取项目数据库
      let savedProjects = JSON.parse(localStorage.getItem('inwlab_projects') || '[]');

      // 如果是空的，初始化两条假数据给教授看效果
      if (savedProjects.length === 0) {
        savedProjects = [
          { id: 1, title: 'Quantum Encryption Protocols', name: 'Dr. Aris Thorne', date: '2026-03-15', summary: 'Developing unbreakable communication lines using quantum entanglement mechanics for next-gen IoT networks.' },
          { id: 2, title: 'AI-Driven Threat Detection', name: 'Sarah Jenkins', date: '2026-04-02', summary: 'A machine learning model that analyzes network traffic behavior to instantly identify and quarantine zero-day malware attacks.' }
        ];
        localStorage.setItem('inwlab_projects', JSON.stringify(savedProjects));
      }
      this.projectList = savedProjects;

      setTimeout(() => {
        if (typeof AOS !== 'undefined') { AOS.init({ duration: 800, once: true }); }
      }, 100);
    }
  }
}
