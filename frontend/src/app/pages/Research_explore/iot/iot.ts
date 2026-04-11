import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CmsService } from '../../../../services/cms.service'; // 🌟 跳 4 层！

declare var AOS: any;

@Component({
  selector: 'app-iot',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './iot.html'
})
export class Iot implements OnInit {
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
            // 🌟 精准获取 IoT 领域的数据
            this.labData = parsed.domains?.iot || {};
          } catch(e) { console.error("Error parsing IoT CMS", e); }
        },
        error: () => console.log('Using default IoT data')
      });

      setTimeout(() => {
        if (typeof AOS !== 'undefined') { AOS.init({ duration: 800, once: true, offset: 50 }); AOS.refreshHard(); window.scrollTo(0, 0); }
      }, 150);
    }
  }
}
