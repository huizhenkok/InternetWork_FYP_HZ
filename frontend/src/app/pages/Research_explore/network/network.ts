import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';

declare var AOS: any;

@Component({
  selector: 'app-network',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './network.html' // 相对路径
})
export class Network implements OnInit {
  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        if (typeof AOS !== 'undefined') {
          AOS.init({ duration: 800, once: true, offset: 50 });
          AOS.refreshHard();
          window.scrollTo(0, 0); // 确保每次进入页面都在最顶部
        }
      }, 150);
    }
  }
}
