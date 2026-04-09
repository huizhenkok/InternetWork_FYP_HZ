import { Component, Input, Output, EventEmitter, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html'
})
export class Navbar implements OnInit {
  @Input() isDarkMode = false;
  @Output() toggleThemeEvent = new EventEmitter<void>();

  isNetappsMenuOpen = false;
  isMobileMenuOpen = false;

  // 🌟 默认显示的年份，如果没有 CMS 数据就用这个保底
  conferenceYears: string[] = ['2026', '2025', '2024', '2023', '2022'];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      // 🌟 动态读取 CMS 里的会议年份，并从大到小排序 (最新年份在最上面)
      const savedConfs = localStorage.getItem('inwlab_cms_conferences');
      if (savedConfs) {
        try {
          const parsed = JSON.parse(savedConfs);
          if (parsed && parsed.length > 0) {
            this.conferenceYears = parsed.map((c: any) => c.year).sort((a: any, b: any) => b - a);
          }
        } catch(e) {}
      }
    }
  }

  onToggleTheme() { this.toggleThemeEvent.emit(); }
  toggleNetappsMenu() { this.isNetappsMenuOpen = !this.isNetappsMenuOpen; }
}
