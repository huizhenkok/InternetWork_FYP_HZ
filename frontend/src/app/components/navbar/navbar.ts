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

  isMobileMenuOpen = false;
  isMobileAboutOpen = false;
  isMobileNetappsOpen = false; // 🌟 新增：控制手机端 NetApps 的展开

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

  toggleMobileMenu() {
    this.isMobileMenuOpen = !this.isMobileMenuOpen;
    document.body.style.overflow = this.isMobileMenuOpen ? 'hidden' : 'auto';
  }

  closeMobileMenu() {
    this.isMobileMenuOpen = false;
    document.body.style.overflow = 'auto';
  }

  toggleMobileAbout() {
    this.isMobileAboutOpen = !this.isMobileAboutOpen;
  }

  // 🌟 新增：手机端 NetApps 展开方法
  toggleMobileNetapps() {
    this.isMobileNetappsOpen = !this.isMobileNetappsOpen;
  }
}
