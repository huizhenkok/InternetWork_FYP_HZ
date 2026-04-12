import { Component, Input, Output, EventEmitter, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CmsService } from '../../../services/cms.service'; // 🌟 引入真实的 CmsService

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

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private cmsService: CmsService // 🌟 注入
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      // 🌟 核心升级：从真实的数据库拉取会议年份列表！彻底消灭 localStorage
      this.cmsService.getCmsData('inwlab_cms_conferences').subscribe({
        next: (res: any) => {
          try {
            const parsed = JSON.parse(res.contentJson);
            if (parsed && parsed.length > 0) {
              // 安全的字符串排序，确保最新年份在最上面
              this.conferenceYears = parsed.map((c: any) => String(c.year)).sort((a: any, b: string) => b.localeCompare(a));
            }
          } catch(e) {}
        }
      });
    }
  }

  onToggleTheme() { this.toggleThemeEvent.emit(); }
}
