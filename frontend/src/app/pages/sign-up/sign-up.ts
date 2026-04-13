import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service';

declare var AOS: any;

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './sign-up.html'
})
export class SignUp implements OnInit {
  regType: 'Student' | 'Alumni' | 'Faculty' = 'Student';

  formData = {
    fullName: '',
    matricNumber: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    // 🌟 新增：存放 3 个安全问题
    secAnsColor: '',
    secAnsState: '',
    secAnsFruit: ''
  };

  // 🌟 密码强度状态控制
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

  // 🌟 核心：实时检测密码强度
  checkPasswordStrength() {
    const p = this.formData.password;
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

  onRegister() {
    // 1. 验证密码强度
    if (!this.isPasswordStrong) {
      alert("Please ensure your password meets all security requirements.");
      return;
    }

    if (this.formData.password !== this.formData.confirmPassword) {
      alert("Passwords do not match. Please try again.");
      return;
    }

    if (!this.formData.fullName.trim() || !this.formData.matricNumber.trim()) {
      alert("Please enter your full name and ID.");
      return;
    }

    // 2. 验证三个安全问题是否填写
    if (!this.formData.secAnsColor.trim() || !this.formData.secAnsState.trim() || !this.formData.secAnsFruit.trim()) {
      alert("Please answer all 3 security questions to secure your account.");
      return;
    }

    // 3. 验证各种 ID 的格式
    if (this.regType === 'Student') {
      if (!/^\d{6}$/.test(this.formData.matricNumber)) {
        alert("Student Matric Number must be exactly 6 digits (e.g., 298068).");
        return;
      }
    } else if (this.regType === 'Faculty' || this.regType === 'Alumni') {
      if (this.formData.matricNumber.length < 4) {
        alert(`${this.regType} ID must be at least 4 characters.`);
        return;
      }
    }

    if (!this.formData.email) {
      alert("Please provide an email.");
      return;
    }

    // 🌟 将安全问题一并打包发给后端
    const newUser = {
      fullName: this.formData.fullName,
      email: this.formData.email.trim(),
      password: this.formData.password,
      role: this.regType,
      matricNumber: this.formData.matricNumber,
      secAnsColor: this.formData.secAnsColor,
      secAnsState: this.formData.secAnsState,
      secAnsFruit: this.formData.secAnsFruit
    };

    this.authService.register(newUser).subscribe({
      next: (response: any) => {
        alert(`Registration Successful as ${this.regType}! Please remember your security answers.`);
        this.router.navigate(['/login']);
      },
      error: (err: any) => {
        console.error("Registration Error:", err);
        alert(err.error || "Registration failed. This email might already be in use.");
      }
    });
  }
}
