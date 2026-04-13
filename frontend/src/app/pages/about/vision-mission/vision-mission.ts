import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { CmsService } from '../../../../services/cms.service';
declare var AOS: any; // 🌟 新增

@Component({
  selector: 'app-vision-mission',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vision-mission.html'
})
export class VisionMission implements OnInit {
  cmsData: any = {};
  defaultData = {
    visionTitle: 'Our Vision', visionTextMalay: 'MENJADI UNIVERSITI PENGURUSAN TERKEMUKA', visionTextEnglish: '"To Be An Eminent Management University"',
    missionTitle: 'Our Mission', missionTextMalay: 'KAMI MENDIDIK PEMIMPIN BERPERWATAKAN HOLISTIK UNTUK BERBAKTI KEPADA KOMUNITI GLOBAL', missionTextEnglish: '"We educate leaders with holistic characteristics to serve the global community"'
  };

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private cmsService: CmsService) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.cmsService.getCmsData('inwlab_cms_about').subscribe({
        next: (res: any) => {
          try {
            const parsed = JSON.parse(res.contentJson);
            this.cmsData = parsed.visionMission || this.defaultData;
          } catch(e) { this.cmsData = this.defaultData; }
        },
        error: () => this.cmsData = this.defaultData
      });

      // 🌟 唤醒滑动动画引擎
      setTimeout(() => { if (typeof AOS !== 'undefined') { AOS.init({ duration: 800, once: true, offset: 50 }); AOS.refreshHard(); window.scrollTo(0, 0); } }, 150);
    }
  }
}
