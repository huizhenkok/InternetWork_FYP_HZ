import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

@Component({
  selector: 'app-philosophy',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './philosophy.html'
})
export class Philosophy implements OnInit {
  cmsData: any = {};

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      const savedAbout = localStorage.getItem('inwlab_cms_about');
      if (savedAbout) {
        this.cmsData = JSON.parse(savedAbout).philosophy || {};
      } else {
        this.cmsData = {
          mainTitle: 'Our Philosophy',
          point1: 'Cognizant of the fact that God will not change...',
          point2: 'Appreciating that Malaysia has been blessed...',
          point3: 'Convinced that humankind cannot subsist merely...',
          point4: 'Universiti Utara Malaysia dedicates itself...',
          mottoTitle: 'University Motto', mottoWord1: 'Knowledge,', mottoWord2: 'Virtue,', mottoWord3: 'Service'
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
