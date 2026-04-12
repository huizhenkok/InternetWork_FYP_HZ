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
    if (this.formData.password !== this.formData.confirmPassword) {
      alert("Passwords do not match. Please try again.");
      return;
    }

    if (!this.formData.fullName.trim()) {
      alert("Please enter your full name.");
      return;
    }

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

    const newUser = {
      fullName: this.formData.fullName,
      email: this.formData.email.trim(), // 🌟 修复：不再强制转小写，原样发送
      password: this.formData.password,
      role: this.regType
    };

    this.authService.register(newUser).subscribe({
      next: (response: any) => {
        alert(`Registration Successful as ${this.regType}! You can now login with your email.`);
        this.router.navigate(['/login']);
      },
      error: (err: any) => {
        console.error("Registration Error:", err);
        alert(err.error || "Registration failed. This email might already be in use.");
      }
    });
  }
}
