import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';

declare var AOS: any;

@Component({
  selector: 'app-cybersecurity',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './cybersecurity.html'
})
export class Cybersecurity implements OnInit {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        if (typeof AOS !== 'undefined') {
          AOS.init({ duration: 800, once: true, offset: 50 });
          AOS.refreshHard();
          window.scrollTo(0, 0); // 每次进来都在最顶端
        }
      }, 150);
    }
  }
}
