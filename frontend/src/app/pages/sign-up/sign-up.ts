import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

declare var AOS: any;

@Component({
  selector: 'app-sign-up',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './sign-up.html'
})
export class SignUp implements OnInit {
  regType: 'Student' | 'Alumni' | 'Faculty' = 'Student'; // 🌟 加入 Faculty

  formData = {
    fullName: '',     // 用户的全名
    matricNumber: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  };

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

    // 3. 验证 ID (根据身份不同验证不同)
    if (this.regType === 'Student') {
      const isIdValid = /^\d{6}$/.test(this.formData.matricNumber);
      if (!isIdValid) {
        alert("Student Matric Number must be exactly 6 digits (e.g., 298068).");
        return;
      }
    } else if (this.regType === 'Faculty') {
      // 🌟 教职员要求填写 Staff ID
      if (!this.formData.matricNumber || this.formData.matricNumber.length < 4) {
        alert("Staff ID must be at least 4 characters.");
        return;
      }
    }

    if (!this.formData.email) {
      alert("Please provide an email.");
      return;
    }

    // 🌟 核心修复区：这次一定要把 fullName 存进去！
    const newUser = {
      fullName: this.formData.fullName, // 👈 之前漏掉了这一行！
      email: this.formData.email.toLowerCase(),
      password: this.formData.password,
      role: this.regType
    };

    let users = JSON.parse(localStorage.getItem('inwlab_users') || '[]');

    const userExists = users.find((u: any) => u.email === newUser.email);
    if (userExists) {
      alert("This email is already registered! Please login.");
      return;
    }

    users.push(newUser);
    localStorage.setItem('inwlab_users', JSON.stringify(users));

    alert(`Registration Successful as ${this.regType}! You can now login with your email.`);
    this.router.navigate(['/login']);
  }
}
