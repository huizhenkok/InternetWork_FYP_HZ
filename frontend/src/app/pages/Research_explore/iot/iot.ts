import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';

declare var AOS: any;

@Component({
  selector: 'app-iot',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './iot.html'
})
export class Iot implements OnInit {
  labData: any = {};

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      const savedData = localStorage.getItem('inwlab_cms_research');
      if (savedData) this.labData = JSON.parse(savedData).domains?.iot || {};

      setTimeout(() => {
        if (typeof AOS !== 'undefined') { AOS.init({ duration: 800, once: true, offset: 50 }); AOS.refreshHard(); window.scrollTo(0, 0); }
      }, 150);
    }
  }
}
