import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../services/auth.service'; // 🌟 正确的跳层路径

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
    confirmPassword: ''
  };

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

  onRegister() {
    // 1. 验证密码
    if (this.formData.password !== this.formData.confirmPassword) {
      alert("Passwords do not match. Please try again.");
      return;
    }

    // 2. 验证名字是否为空
    if (!this.formData.fullName.trim()) {
      alert("Please enter your full name.");
      return;
    }

    // 3. 验证 ID
    if (this.regType === 'Student') {
      const isIdValid = /^\d{6}$/.test(this.formData.matricNumber);
      if (!isIdValid) {
        alert("Student Matric Number must be exactly 6 digits (e.g., 298068).");
        return;
      }
    } else if (this.regType === 'Faculty') {
      if (!this.formData.matricNumber || this.formData.matricNumber.length < 4) {
        alert("Staff ID must be at least 4 characters.");
        return;
      }
    }

    if (!this.formData.email) {
      alert("Please provide an email.");
      return;
    }

    // 组合要发送给后端的数据
    const newUser = {
      fullName: this.formData.fullName,
      email: this.formData.email.toLowerCase(),
      password: this.formData.password,
      role: this.regType
    };

    // 🌟 核心：调用 AuthService 发送真实请求到数据库
    this.authService.register(newUser).subscribe({
      next: (response: any) => { // 🌟 修复严格模式报错
        alert(`Registration Successful as ${this.regType}! You can now login with your email.`);
        this.router.navigate(['/login']);
      },
      error: (err: any) => { // 🌟 修复严格模式报错
        console.error("Registration Error:", err);
        alert(err.error || "Registration failed. This email might already be in use.");
      }
    });
  }
}
