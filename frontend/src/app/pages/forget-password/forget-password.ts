import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

declare var AOS: any;

@Component({
  selector: 'app-forget-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './forget-password.html'
})
export class ForgetPassword implements OnInit {
  email: string = '';
  isSent: boolean = false; // 控制是否显示“发送成功”

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        if (typeof AOS !== 'undefined') {
          AOS.init({ duration: 800, once: true, offset: 50 });
          AOS.refreshHard();
          window.scrollTo(0, 0);
        }
      }, 150);
    }
  }

  // 模拟发送重置链接
  onReset() {
    if (!this.email) {
      alert("Please enter your registered email address.");
      return;
    }

    // 检查 LocalStorage 里有没有这个邮箱
    const users = JSON.parse(localStorage.getItem('inwlab_users') || '[]');
    const userExists = users.find((u: any) => u.email === this.email.toLowerCase());

    if (!userExists) {
      alert("Error: No account found with this email address.");
      return;
    }

    // 模拟网络发送延迟
    setTimeout(() => {
      this.isSent = true;
    }, 800);
  }
}
