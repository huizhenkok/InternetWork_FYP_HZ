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
  isMobileMenuOpen = false; // 🌟 移动端菜单开关
  isMobileAboutOpen = false; // 🌟 移动端 About Us 折叠菜单开关

  conferenceYears: string[] = [];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private cmsService: CmsService
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
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

  // 🌟 移动端菜单控制方法
  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    if (this.isMobileMenuOpen) {
      document.body.style.overflow = 'hidden'; // 防止底部背景滚动
    } else {
      document.body.style.overflow = 'auto';
    }
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
    document.body.style.overflow = 'auto';
  }

  toggleMobileAbout() {
    this.isMobileAboutOpen = !this.isMobileAboutOpen;
  }
}
