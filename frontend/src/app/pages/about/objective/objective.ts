import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-objective',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './objective.html'
})
export class Objective implements OnInit {
  cmsData: any = {};

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      const savedAbout = localStorage.getItem('inwlab_cms_about');
      if (savedAbout) {
        this.cmsData = JSON.parse(savedAbout).objective || {};
      } else {
        this.cmsData = {
          mainTitle: 'University Objectives',
          paragraph1: 'Universiti Utara Malaysia was established to primarily develop...',
          paragraph2: 'Universiti Utara Malaysia also acts as a catalyst...',
          paragraph3: 'In addition to its core business...',
          thrustsTitle: 'Three Major Thrusts',
          thrust1: 'To be the centre of excellence for management education.',
          thrust2: 'To be the leading referral centre in all aspects of management scholarship and practice.',
          thrust3: 'To be the premier resource centre in the field of management studies.'
        };
      }
      window.scrollTo(0, 0);
    }
  }

  get titleFirstPart(): string {
    const words = this.cmsData.mainTitle.trim().split(' ');
    return words.length <= 1 ? this.cmsData.mainTitle : words.slice(0, -1).join(' ');
  }
  get titleLastPart(): string {
    const words = this.cmsData.mainTitle.trim().split(' ');
    return words.length <= 1 ? '' : words[words.length - 1];
  }
}
