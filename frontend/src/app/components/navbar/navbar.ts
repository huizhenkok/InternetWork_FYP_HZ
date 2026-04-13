import { Component, Input, Output, EventEmitter, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { CmsService } from '../../../services/cms.service';

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

  conferenceYears: string[] = [];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private cmsService: CmsService
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      // 从 MySQL 获取会议年份
      this.cmsService.getCmsData('inwlab_cms_conferences').subscribe({
        next: (res: any) => {
          try {
            const parsed = JSON.parse(res.contentJson);
            if (parsed && parsed.length > 0) {
              this.conferenceYears = parsed.map((c: any) => String(c.year)).sort((a: any, b: string) => b.localeCompare(a));
            }
          } catch(e) {}
        }
      });
    }
  }

  onToggleTheme() { this.toggleThemeEvent.emit(); }
}
