import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-vision-mission',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './vision-mission.html'
})
export class VisionMission implements OnInit {
  cmsData: any = {};

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      const savedAbout = localStorage.getItem('inwlab_cms_about');
      if (savedAbout) {
        this.cmsData = JSON.parse(savedAbout).visionMission || {};
      } else {
        // Default Fallback
        this.cmsData = {
          visionTitle: 'Our Vision', visionTextMalay: 'MENJADI UNIVERSITI PENGURUSAN TERKEMUKA', visionTextEnglish: '"To Be An Eminent Management University"',
          missionTitle: 'Our Mission', missionTextMalay: 'KAMI MENDIDIK PEMIMPIN BERPERWATAKAN HOLISTIK UNTUK BERBAKTI KEPADA KOMUNITI GLOBAL', missionTextEnglish: '"We educate leaders with holistic characteristics to serve the global community"'
        };
      }
      window.scrollTo(0, 0);
    }
  }
}
