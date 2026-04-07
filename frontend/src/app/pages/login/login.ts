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

  // 🌟 修复点 1：普通登录签发通行证 (加入 Faculty 路由)
  onLogin() {
    const email = this.loginData.email.toLowerCase().trim();
    const password = this.loginData.password;

    if (!email || !password) {
      alert("Please enter both email and password.");
      return;
    }

    const users = JSON.parse(localStorage.getItem('inwlab_users') || '[]');
    const foundUser = users.find((u: any) => u.email === email && u.password === password);

    if (foundUser) {
      alert("Authentication Successful! Welcome back.");

      // 🌟 【核心魔法】保存当前登录的用户为 Active User
      localStorage.setItem('active_user', JSON.stringify(foundUser));

      // 🌟 根据身份动态跳转到不同的 Dashboard
      if (foundUser.role === 'Student') {
        this.router.navigate(['/student']);
      } else if (foundUser.role === 'Faculty') {
        this.router.navigate(['/faculty']);
      } else {
        this.router.navigate(['/alumni']);
      }
    } else {
      if (email === 'admin@uum.edu.my') {
        // 万能后门测试账号
        localStorage.setItem('active_user', JSON.stringify({ fullName: 'System Admin', role: 'Faculty' }));
        this.router.navigate(['/faculty']);
      } else {
        alert("Invalid Email or Password. Please Create an Account first.");
      }
    }
  }

  // 🌟 修复点 2：SSO 模拟回传名字资料 (加入 Faculty 区分)
  loginWithUniversityId() {
    const ssoId = prompt("--- UUM PORTAL SIMULATION ---\n\n(Backend pending...)\nPlease enter your University ID to verify:\n- 6 digits (e.g. 299326) for Student\n- 4+ digits (e.g. 6003) for Alumni/Staff");

    if (ssoId) {
      // 模拟 UUM 系统要求确认你的全名
      const ssoName = prompt("UUM IDENTITY VERIFIED.\n\nPlease enter your First Name to retrieve your UUM profile data:") || "Scholar";

      setTimeout(() => {
        if (/^\d{6}$/.test(ssoId)) {
          alert("Identity Confirmed: UUM Student.\nRedirecting to Dashboard...");
          localStorage.setItem('active_user', JSON.stringify({ fullName: ssoName, role: 'Student' }));
          this.router.navigate(['/student']);
        } else if (ssoId.length >= 4) {
          // 简单区分一下 Staff 和 Alumni
          const isFaculty = confirm("Click OK if you are a Faculty/Staff member, or Cancel if you are an Alumni.");
          const assignedRole = isFaculty ? 'Faculty' : 'Alumni';

          alert(`Identity Confirmed: UUM ${assignedRole}.\nRedirecting to Dashboard...`);
          localStorage.setItem('active_user', JSON.stringify({ fullName: ssoName, role: assignedRole }));

          if (assignedRole === 'Faculty') {
            this.router.navigate(['/faculty']);
          } else {
            this.router.navigate(['/alumni']);
          }
        } else {
          alert("UUM Portal Error: Invalid ID format.");
        }
      }, 1000);
    }
  }

  navigateToForgetPassword() {
    this.router.navigate(['/forget-password']);
  }

  togglePassword() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }
}
