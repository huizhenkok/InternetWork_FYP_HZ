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

  // 🌟 默认空白，一切以 CMS 数据库为准
  conferenceYears: string[] = [];

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      // 🌟 核心：强制且唯一地从 CMS 读取年份列表！
      const savedConfs = localStorage.getItem('inwlab_cms_conferences');
      if (savedConfs) {
        try {
          const parsed = JSON.parse(savedConfs);
          if (parsed && parsed.length > 0) {
            // 安全的字符串排序，确保 "2028", "2027", "test" 都能按顺序排好
            this.conferenceYears = parsed.map((c: any) => String(c.year)).sort((a: any, b: string) => b.localeCompare(a));
          }
        } catch(e) {}
      }
    }
  }

  onToggleTheme() { this.toggleThemeEvent.emit(); }
}
