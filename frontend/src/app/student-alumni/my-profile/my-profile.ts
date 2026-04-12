import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, HostListener, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';

declare var AOS: any;

@Component({
  selector: 'app-my-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-profile.html' // 🌟 已经修复：去掉了多余的 "template"
})
export class MyProfile implements OnInit, AfterViewInit {

  isEditMode: boolean = false;
  newTagValue: string = '';

  userProfile: any = {
    fullName: '',
    email: '',
    role: '',
    matricNumber: '',
    phone: '',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB0LswD0_6irjogIzA3SEKVww65eL9MDC5InK_ldo0TgrBDvcOlxglRnAHQap3CUDcsYblW9c8yug3byVje8c9h7svi3qK3Gx6PvFWJeBVPSGjSSC0DX7lN9ZjRCIgL2EpEdS1poq11nRv9VH-I90CYqx740GMVe1Ig4StAHOZRz3SphaRhNlOpTVhMChLa_iKqvy5nnfxOaRLwKc7rDI8slIvuHePon6eaKctGadtuI857f0fI74GvSCsWduEp0gWbP72OaeKera6z',
    researchInterests: 'Currently focusing on IoT security protocols and machine learning applications in network defense.',
    focusAreas: ['Network Security', 'IoT Systems'],
    jobTitle: '',
    company: ''
  };

  @ViewChild('particleCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D | null;
  private particles: any[] = [];
  private animationFrameId: number = 0;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    this.loadProfile();
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.initParticles();
      this.refreshAnimations();
    }
  }

  loadProfile() {
    try {
      const activeUserStr = localStorage.getItem('active_user');
      if (activeUserStr) {
        const activeUser = JSON.parse(activeUserStr);
        this.userProfile = { ...this.userProfile, ...activeUser };
      }
    } catch (e) {
      console.error("Error loading profile", e);
    }
  }

  toggleEditMode(status: boolean) {
    this.isEditMode = status;
    this.newTagValue = '';
    if (!status) {
      this.loadProfile();
    }
    this.refreshAnimations();
  }

  saveProfile() {
    if (!this.userProfile.fullName.trim()) {
      alert("Full Name cannot be empty.");
      return;
    }

    if (this.newTagValue.trim()) {
      this.addTag();
    }

    try {
      localStorage.setItem('active_user', JSON.stringify(this.userProfile));

      let users = JSON.parse(localStorage.getItem('inwlab_users') || '[]');
      const index = users.findIndex((u: any) => u.email === this.userProfile.email);
      if (index !== -1) {
        users[index] = { ...users[index], ...this.userProfile };
        localStorage.setItem('inwlab_users', JSON.stringify(users));
      }

      alert("Profile updated successfully in your local session.");
      this.isEditMode = false;
      this.refreshAnimations();

    } catch (e) {
      console.error("Error saving profile", e);
      alert("Failed to save profile. Please try again.");
    }
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.userProfile.avatar = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  addTag() {
    const value = this.newTagValue.trim();
    if (value && !this.userProfile.focusAreas.includes(value)) {
      this.userProfile.focusAreas = [...this.userProfile.focusAreas, value];
    }
    this.newTagValue = '';
  }

  removeTag(tag: string) {
    this.userProfile.focusAreas = this.userProfile.focusAreas.filter((t: string) => t !== tag);
  }

  refreshAnimations() {
    setTimeout(() => {
      if (typeof AOS !== 'undefined') {
        AOS.init({ duration: 800, once: true, offset: 50 });
        AOS.refreshHard();
        window.scrollTo(0, 0);
      }
    }, 100);
  }

  initParticles() {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d');
    if (!this.ctx) return;
    this.resizeCanvas();
    this.createParticles();
    this.animateParticles();
  }

  @HostListener('window:resize')
  resizeCanvas() {
    if (!this.canvasRef) return;
    const canvas = this.canvasRef.nativeElement;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  createParticles() {
    const canvas = this.canvasRef.nativeElement;
    const particleCount = window.innerWidth < 768 ? 40 : 80;
    this.particles = [];
    for (let i = 0; i < particleCount; i++) {
      this.particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.8,
        vy: (Math.random() - 0.5) * 0.8,
        radius: Math.random() * 2 + 1
      });
    }
  }

  animateParticles() {
    if (!this.ctx) return;
    const canvas = this.canvasRef.nativeElement;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    const isDark = document.documentElement.classList.contains('dark');
    const rgb = isDark ? '13, 242, 242' : '8, 145, 178';
    for (let i = 0; i < this.particles.length; i++) {
      let p = this.particles[i];
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;
      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(${rgb}, 0.5)`;
      this.ctx.fill();
      for (let j = i + 1; j < this.particles.length; j++) {
        let p2 = this.particles[j];
        let dx = p.x - p2.x; let dy = p.y - p2.y;
        let dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          this.ctx.beginPath();
          this.ctx.moveTo(p.x, p.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.strokeStyle = `rgba(${rgb}, ${1 - dist / 120})`;
          this.ctx.lineWidth = 0.5;
          this.ctx.stroke();
        }
      }
    }
    this.animationFrameId = requestAnimationFrame(() => this.animateParticles());
  }
}
