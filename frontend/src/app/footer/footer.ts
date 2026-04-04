import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.html'
})
export class Footer {

  // 注入 Router，用来判断当前所在的网页网址
  constructor(public router: Router) {}

  // 🌟 核心魔法：自动判断当前网址有没有包含 '/conference'
  get isConferencePage(): boolean {
    return this.router.url.includes('/conference');
  }
}
