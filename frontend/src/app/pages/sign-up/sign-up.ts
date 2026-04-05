import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

declare var AOS: any; // 🌟 声明动画引擎

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './sign-up.html'
})
export class SignUp implements OnInit {
  regType: 'Student' | 'Alumni' = 'Student';

  formData = {
    fullName: '',
    matricNumber: '', // 仅 Student 需要
    email: '',
    phone: '',        // Optional
    password: '',
    confirmPassword: '' // 确认密码
  };

  constructor(
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object // 🌟 注入平台判断
  ) {}

  // 🌟 核心修复：进页面时，强制唤醒 AOS 动画引擎！
  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        if (typeof AOS !== 'undefined') {
          AOS.init({ duration: 800, once: true, offset: 50 });
          AOS.refreshHard();
          window.scrollTo(0, 0); // 确保页面在最顶部
        }
      }, 150); // 给 150ms 缓冲，保证动画绝对丝滑
    }
  }

  onRegister() {
    // 1. 验证两次密码是否一致
    if (this.formData.password !== this.formData.confirmPassword) {
      alert("Passwords do not match. Please try again.");
      return;
    }

    if (this.regType === 'Student') {
      // 2. 验证学生：必须有 6 位 Matric Number
      const isIdValid = /^\d{6}$/.test(this.formData.matricNumber);
      if (!isIdValid) {
        alert("Student Matric Number must be exactly 6 digits (e.g., 298068).");
        return;
      }
    }

    // 简单验证邮箱
    if (!this.formData.email) {
      alert("Please provide an email.");
      return;
    }

    alert(`Registration Successful as ${this.regType}! Redirecting to Login...`);
    this.router.navigate(['/login']);
  }
}
