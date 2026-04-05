import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

declare var AOS: any;

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './login.html'
})
export class Login implements OnInit {
  loginData = {
    email: '',
    password: ''
  };

  isPasswordVisible: boolean = false;

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        if (typeof AOS !== 'undefined') {
          AOS.init({ duration: 800, once: true, offset: 50 });
          AOS.refreshHard();
        }
      }, 150);
    }
  }

  // 🌟 1. 修复 Authenticate 跳转逻辑
  onLogin() {
    const email = this.loginData.email.toLowerCase().trim();

    if (!email || !this.loginData.password) {
      alert("Please enter both email and password.");
      return;
    }

    // 区分 Student 和 Alumni
    if (email.endsWith('@student.uum.edu.my')) {
      alert("Authentication Successful! Redirecting to Student Dashboard...");
      this.router.navigate(['/student']); // 确保路由中配置了 /student
    } else if (email.endsWith('@alumni.uum.edu.my')) {
      alert("Authentication Successful! Redirecting to Alumni Dashboard...");
      this.router.navigate(['/alumni']); // 确保路由中配置了 /alumni
    } else {
      alert("Login Failed: Please use your UUM official email (@student.uum.edu.my or @alumni.uum.edu.my).");
    }
  }

  // 🌟 2. 修复 University ID 跳转 (UUM SSO)
  loginWithUniversityId() {
    const ssoUrl = "https://auth.uum.edu.my/nidp/idff/sso?id=3&sid=0&option=credential&sid=0&target=https://portal.uum.edu.my/";

    if (confirm("You are now redirecting to UUM Official Portal for identity verification. Once verified, you will be returned to INWLab Nexus.")) {
      // 在实际生产中，验证后 UUM 会重定向回来。在原型演示时，我们可以模拟这个过程。
      window.open(ssoUrl, '_blank');

      // 模拟 3 秒后验证成功并自动进入系统（用于展示 Prototype）
      setTimeout(() => {
        alert("Verification Success from UUM Portal! Welcome back.");
        this.router.navigate(['/student']);
      }, 3000);
    }
  }

  // 🌟 4. 修复 Forget Password 跳转
  navigateToForgetPassword() {
    this.router.navigate(['/forget-password']);
  }

  togglePassword() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }
}
