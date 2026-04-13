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
    const email = this.loginData.email.trim();
    const password = this.loginData.password;

    if (!email || !password) {
      alert("Please enter both email and password.");
      return;
    }

    this.authService.login({ email, password }).subscribe({
      next: (userFromDatabase: any) => {
        alert(`Authentication Successful! Welcome back, ${userFromDatabase.fullName}.`);
        localStorage.setItem('active_user', JSON.stringify(userFromDatabase));

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

  navigateToForgetPassword() {
    this.router.navigate(['/forget-password']);
  }

  togglePassword() {
    this.isPasswordVisible = !this.isPasswordVisible;
  }
}
