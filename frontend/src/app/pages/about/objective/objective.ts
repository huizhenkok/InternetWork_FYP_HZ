import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { CmsService } from '../../../../services/cms.service';
declare var AOS: any; // 🌟 新增

@Component({
  selector: 'app-objective',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './objective.html'
})
export class Objective implements OnInit {
  cmsData: any = {};
  defaultData = {
    mainTitle: 'University Objectives', paragraph1: 'Universiti Utara Malaysia was established to primarily develop...', paragraph2: 'Universiti Utara Malaysia also acts as a catalyst...', paragraph3: 'In addition to its core business...', thrustsTitle: 'Three Major Thrusts', thrust1: 'To be the centre of excellence for management education.', thrust2: 'To be the leading referral centre in all aspects of management scholarship and practice.', thrust3: 'To be the premier resource centre in the field of management studies.'
  };

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private cmsService: CmsService) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.cmsService.getCmsData('inwlab_cms_about').subscribe({
        next: (res: any) => {
          try {
            const parsed = JSON.parse(res.contentJson);
            this.cmsData = parsed.objective || this.defaultData;
          } catch(e) { this.cmsData = this.defaultData; }
        },
        error: () => this.cmsData = this.defaultData
      });

      // 🌟 唤醒滑动动画引擎
      setTimeout(() => { if (typeof AOS !== 'undefined') { AOS.init({ duration: 800, once: true, offset: 50 }); AOS.refreshHard(); window.scrollTo(0, 0); } }, 150);
    }
  }

  get titleFirstPart(): string {
    const words = (this.cmsData.mainTitle || '').trim().split(' ');
    return words.length <= 1 ? (this.cmsData.mainTitle || '') : words.slice(0, -1).join(' ');
  }
  get titleLastPart(): string {
    const words = (this.cmsData.mainTitle || '').trim().split(' ');
    return words.length <= 1 ? '' : words[words.length - 1];
  }
}
