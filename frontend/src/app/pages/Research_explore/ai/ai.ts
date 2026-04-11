import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CmsService } from '../../../../services/cms.service'; // 🌟 跳 4 层！径

declare var AOS: any;

@Component({
  selector: 'app-ai',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './ai.html'
})
export class Ai implements OnInit {
  labData: any = {};

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private cmsService: CmsService
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {

      // 🌟 从数据库拉取 Research 数据，并精准定位到 ai 领域
      this.cmsService.getCmsData('inwlab_cms_research').subscribe({
        next: (res: any) => {
          try {
            const parsed = JSON.parse(res.contentJson);
            this.labData = parsed.domains?.ai || {};
          } catch(e) { console.error("Error parsing AI CMS", e); }
        },
        error: () => console.log('Using default AI data')
      });

      setTimeout(() => {
        if (typeof AOS !== 'undefined') { AOS.init({ duration: 800, once: true, offset: 50 }); AOS.refreshHard(); window.scrollTo(0, 0); }
      }, 150);
    }
  }
}
