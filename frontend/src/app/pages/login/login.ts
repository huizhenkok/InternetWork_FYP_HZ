import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service';

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
    private authService: AuthService,
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

  onLogin() {
    // 🌟 核心修复 1：去掉了 .toLowerCase()，保留你的大写 'IOT' 原样去数据库核对
    const email = this.loginData.email.trim();
    const password = this.loginData.password;

    if (!email || !password) {
      alert("Please enter both email and password.");
      return;
    }

    // 🌟 核心修复 2：彻底删除了 admintest 的硬编码后门！
    // 现在所有人（包括 Admin）都必须经过真实的数据库校验！

    this.authService.login({ email, password }).subscribe({
      next: (userFromDatabase: any) => {
        alert(`Authentication Successful! Welcome back, ${userFromDatabase.fullName}.`);

        // 保存用户状态到浏览器，维持登录
        localStorage.setItem('active_user', JSON.stringify(userFromDatabase));

        // 🌟 核心修复 3：加入真实的 Admin 路由跳转
        if (userFromDatabase.role === 'Admin') {
          this.router.navigate(['/admin-dashboard']);
        } else if (userFromDatabase.role === 'Student') {
          this.router.navigate(['/student']);
        } else if (userFromDatabase.role === 'Faculty') {
          this.router.navigate(['/faculty']);
        } else {
          this.router.navigate(['/alumni']);
        }
      },
      error: (err: any) => {
        console.error("Login Error:", err);
        alert("Invalid Email or Password. Please try again or Create an Account.");
      }
    });
  }

  loginWithUniversityId() {
    const ssoId = prompt("--- UUM PORTAL SIMULATION ---\n\n(Backend pending...)\nPlease enter your University ID to verify:\n- 6 digits (e.g. 299326) for Student\n- 4+ digits (e.g. 6003) for Alumni/Staff");

    if (ssoId) {
      const ssoName = prompt("UUM IDENTITY VERIFIED.\n\nPlease enter your First Name to retrieve your UUM profile data:") || "Scholar";

      setTimeout(() => {
        if (/^\d{6}$/.test(ssoId)) {
          alert("Identity Confirmed: UUM Student.\nRedirecting to Dashboard...");
          localStorage.setItem('active_user', JSON.stringify({ fullName: ssoName, role: 'Student' }));
          this.router.navigate(['/student']);
        } else if (ssoId.length >= 4) {
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
