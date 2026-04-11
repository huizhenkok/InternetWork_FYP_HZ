import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../../services/auth.service'; // 🌟 正确的跳层路径

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
    const email = this.loginData.email.toLowerCase().trim();
    const password = this.loginData.password;

    if (!email || !password) {
      alert("Please enter both email and password.");
      return;
    }

    // 🌟 保留 Admin 的专属通道
    if (email === 'admintest@gmail.com' && password === '123') {
      alert("Admin Authentication Successful! Accessing Command Center...");
      localStorage.setItem('active_user', JSON.stringify({ fullName: 'System Admin', email: 'admintest@gmail.com', role: 'Admin' }));
      this.router.navigate(['/admin-dashboard']);
      return;
    }

    // 🌟 核心：调用 AuthService 向后端发起真实登录请求
    this.authService.login({ email, password }).subscribe({
      next: (userFromDatabase: any) => { // 🌟 修复严格模式报错
        alert(`Authentication Successful! Welcome back, ${userFromDatabase.fullName}.`);

        // 保存用户状态
        localStorage.setItem('active_user', JSON.stringify(userFromDatabase));

        // 根据真实的 Role 跳转
        if (userFromDatabase.role === 'Student') {
          this.router.navigate(['/student']);
        } else if (userFromDatabase.role === 'Faculty') {
          this.router.navigate(['/faculty']);
        } else {
          this.router.navigate(['/alumni']);
        }
      },
      error: (err: any) => { // 🌟 修复严格模式报错
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
