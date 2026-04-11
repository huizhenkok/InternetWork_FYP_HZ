import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { CmsService } from '../../../../services/cms.service'; // 🌟 引入 CmsService

@Component({
  selector: 'app-vision-mission',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vision-mission.html'
})
export class VisionMission implements OnInit {
  cmsData: any = {};

  // 默认备用数据
  defaultData = {
    visionTitle: 'Our Vision', visionTextMalay: 'MENJADI UNIVERSITI PENGURUSAN TERKEMUKA', visionTextEnglish: '"To Be An Eminent Management University"',
    missionTitle: 'Our Mission', missionTextMalay: 'KAMI MENDIDIK PEMIMPIN BERPERWATAKAN HOLISTIK UNTUK BERBAKTI KEPADA KOMUNITI GLOBAL', missionTextEnglish: '"We educate leaders with holistic characteristics to serve the global community"'
  };

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private cmsService: CmsService // 🌟 注入 CmsService
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {

      // 🌟 核心修改：从 MySQL 数据库拉取 About 数据，并提取 visionMission 部分
      this.cmsService.getCmsData('inwlab_cms_about').subscribe({
        next: (res: any) => {
          try {
            const parsed = JSON.parse(res.contentJson);
            this.cmsData = parsed.visionMission || this.defaultData;
          } catch(e) {
            console.error("Error parsing Vision/Mission CMS", e);
            this.cmsData = this.defaultData;
          }
        },
        error: () => this.cmsData = this.defaultData
      });

      window.scrollTo(0, 0);
    }
  }
}
