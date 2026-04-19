import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, HostListener, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UploadService } from '../../../services/upload.service'; // 🌟 需要上传图片服务

declare var AOS: any;

@Component({
  selector: 'app-my-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-profile.html'
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
    avatar: 'https://ui-avatars.com/api/?name=User&background=random',
    researchInterests: 'Currently focusing on IoT security protocols and machine learning applications in network defense.',
    focusAreas: ['Network Security', 'IoT Systems'],
    jobTitle: '',
    company: ''
  };

  @ViewChild('particleCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D | null;
  private particles: any[] = [];
  private animationFrameId: number = 0;

  selectedFile: File | null = null; // 🌟 保存用户选中的图片文件

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private uploadService: UploadService // 🌟 注入上传服务
  ) {}

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
    this.selectedFile = null; // 退出编辑时清空已选文件
    if (!status) {
      this.loadProfile(); // Discard changes
    }
    this.refreshAnimations();
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file; // 🌟 把文件存起来准备发给服务器
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.userProfile.avatar = e.target.result; // 只是预览
      };
      reader.readAsDataURL(file);
    }
  }

  // 🌟 核心修复：保存到后端数据库
  saveProfile() {
    if (!this.userProfile.fullName.trim()) {
      alert("Full Name cannot be empty.");
      return;
    }

    if (this.newTagValue.trim()) {
      this.addTag();
    }

    // 第一步：如果有新图片，先上传图片到服务器
    if (this.selectedFile) {
      this.uploadService.uploadFile(this.selectedFile).subscribe({
        next: (res: any) => {
          this.userProfile.avatar = res.url; // 拿到服务器给的真实图片链接
          this.sendDataToServer(); // 接着发数据
        },
        error: () => {
          alert("Failed to upload profile picture. Please try again.");
        }
      });
    } else {
      // 没有换照片，直接发数据
      this.sendDataToServer();
    }
  }

  // 🌟 把更新后的资料发送到我们刚才在 server.js 加的 /api/users/update 接口
  sendDataToServer() {
    fetch('https://internetworks.my/api/users/update', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(this.userProfile)
    }).then(response => {
      if(response.ok) {
        // 服务器存成功了，再更新本地缓存
        localStorage.setItem('active_user', JSON.stringify(this.userProfile));
        alert("Profile successfully updated and saved to the server!");
        this.isEditMode = false;
        this.refreshAnimations();
      } else {
        alert("Error saving profile to database.");
      }
    }).catch(err => {
      console.error(err);
      alert("Network error. Could not connect to server.");
    });
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
