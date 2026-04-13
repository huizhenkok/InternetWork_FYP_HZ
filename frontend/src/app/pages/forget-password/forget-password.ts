import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service'; // 🌟 引入 AuthService

declare var AOS: any;

@Component({
  selector: 'app-forget-password',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './forget-password.html'
})
export class ForgetPassword implements OnInit {

  // 🌟 步骤控制：1=验证问题, 2=重设密码, 3=成功
  currentStep: number = 1;

  // 表单数据
  email: string = '';
  ansColor: string = '';
  ansState: string = '';
  ansFruit: string = '';

  newPassword: string = '';
  confirmPassword: string = '';

  // 密码强度检测
  isPasswordStrong: boolean = false;
  passwordFeedback: string = '';

  constructor(
    private router: Router,
    private authService: AuthService,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

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

  // 🌟 步骤 1：向后端发送安全答案进行核对
  verifyAnswers() {
    if (!this.email || !this.ansColor || !this.ansState || !this.ansFruit) {
      alert("Please fill in your email and all 3 security answers.");
      return;
    }

    const payload = {
      email: this.email.trim(),
      ansColor: this.ansColor.trim(),
      ansState: this.ansState.trim(),
      ansFruit: this.ansFruit.trim()
    };

    this.authService.verifySecurityQuestions(payload).subscribe({
      next: (res: any) => {
        // 后端返回 200 OK，说明答案全对！进入第二步
        this.currentStep = 2;
      },
      error: (err: any) => {
        console.error("Verification Error:", err);
        alert(err.error || "Verification failed. Email not found or answers are incorrect.");
      }
    });
  }

  // 🌟 密码强度实时检测
  checkPasswordStrength() {
    const p = this.newPassword;
    if (!p) {
      this.isPasswordStrong = false;
      this.passwordFeedback = '';
      return;
    }

    const hasUpper = /[A-Z]/.test(p);
    const hasLower = /[a-z]/.test(p);
    const hasNumber = /[0-9]/.test(p);
    const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(p);
    const isLongEnough = p.length > 10;

    if (hasUpper && hasLower && hasNumber && hasSpecial && isLongEnough) {
      this.isPasswordStrong = true;
      this.passwordFeedback = 'Strong Password';
    } else {
      this.isPasswordStrong = false;
      this.passwordFeedback = 'Weak: >10 chars, uppercase, lowercase, number, symbol needed.';
    }
  }

  // 🌟 步骤 2：提交新密码到后端更新
  submitNewPassword() {
    if (!this.isPasswordStrong) {
      alert("Please ensure your new password meets all security requirements.");
      return;
    }

    if (this.newPassword !== this.confirmPassword) {
      alert("Passwords do not match. Please try again.");
      return;
    }

    const payload = {
      email: this.email.trim(),
      newPassword: this.newPassword
    };

    this.authService.resetPassword(payload).subscribe({
      next: (res: any) => {
        // 密码重置成功！
        this.currentStep = 3;
      },
      error: (err: any) => {
        console.error("Reset Error:", err);
        alert("An error occurred while resetting the password. Please try again.");
      }
    });
  }
}
