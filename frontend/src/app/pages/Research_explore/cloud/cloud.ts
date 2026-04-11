import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CmsService } from '../../../../services/cms.service'; // 🌟 跳 4 层！

declare var AOS: any;

@Component({
  selector: 'app-cloud',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cloud.html'
})
export class Cloud implements OnInit {
  labData: any = {};

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private cmsService: CmsService
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {

      this.cmsService.getCmsData('inwlab_cms_research').subscribe({
        next: (res: any) => {
          try {
            const parsed = JSON.parse(res.contentJson);
            this.labData = parsed.domains?.cloud || {};
          } catch(e) { console.error("Error parsing Cloud CMS", e); }
        },
        error: () => console.log('Using default Cloud data')
      });

      setTimeout(() => {
        if (typeof AOS !== 'undefined') { AOS.init({ duration: 800, once: true, offset: 50 }); AOS.refreshHard(); window.scrollTo(0, 0); }
      }, 150);
    }
  }
}
