import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, HostListener, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';

declare var AOS: any;

@Component({
  selector: 'app-my-profile',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-profile.html'
})
export class MyProfile implements OnInit, AfterViewInit {

  // 🌟 控制当前是 View 模式还是 Edit 模式
  isEditMode: boolean = false;

  // 用户的详细资料模型
  userProfile: any = {
    fullName: '',
    email: '',
    role: '',
    matricNumber: '', // 学生才有
    phone: '',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB0LswD0_6irjogIzA3SEKVww65eL9MDC5InK_ldo0TgrBDvcOlxglRnAHQap3CUDcsYblW9c8yug3byVje8c9h7svi3qK3Gx6PvFWJeBVPSGjSSC0DX7lN9ZjRCIgL2EpEdS1poq11nRv9VH-I90CYqx740GMVe1Ig4StAHOZRz3SphaRhNlOpTVhMChLa_iKqvy5nnfxOaRLwKc7rDI8slIvuHePon6eaKctGadtuI857f0fI74GvSCsWduEp0gWbP72OaeKera6z', // 默认头像
    researchInterests: 'Currently focusing on IoT security protocols and machine learning applications in network defense.',
    focusAreas: ['Network Security', 'IoT Systems'],
    jobTitle: '', // 校友才有
    company: ''   // 校友才有
  };

  // 🌟 粒子背景相关变量
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

  // 🌟 1. 从数据库读取个人资料
  loadProfile() {
    try {
      const activeUserStr = localStorage.getItem('active_user');
      if (activeUserStr) {
        const activeUser = JSON.parse(activeUserStr);
        // 把提取到的资料合并到默认的 userProfile 里
        this.userProfile = { ...this.userProfile, ...activeUser };
      }
    } catch (e) {
      console.error("Error loading profile", e);
    }
  }

  // 🌟 2. 切换模式
  toggleEditMode(status: boolean) {
    this.isEditMode = status;
    // 如果取消编辑，重新读取一遍资料，把未保存的改动覆盖掉
    if (!status) {
      this.loadProfile();
    }
    this.refreshAnimations();
  }

  // 🌟 3. 保存资料（同步到全局）
  saveProfile() {
    // 检查名字不能为空
    if (!this.userProfile.fullName.trim()) {
      alert("Full Name cannot be empty.");
      return;
    }

    try {
      // A. 更新当前的 Active User
      localStorage.setItem('active_user', JSON.stringify(this.userProfile));

      // B. 更新总数据库里的记录 (用 email 匹配)
      let users = JSON.parse(localStorage.getItem('inwlab_users') || '[]');
      const index = users.findIndex((u: any) => u.email === this.userProfile.email);
      if (index !== -1) {
        // 找到了，更新数据库里的资料
        users[index] = { ...users[index], ...this.userProfile };
        localStorage.setItem('inwlab_users', JSON.stringify(users));
      }

      alert("Profile updated successfully! System records synchronized.");
      this.isEditMode = false;
      this.refreshAnimations();

    } catch (e) {
      console.error("Error saving profile", e);
      alert("Failed to save profile. Please try again.");
    }
  }

  // 🌟 4. 处理头像上传 (模拟读取本地文件转成 Base64)
  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.userProfile.avatar = e.target.result; // 把图片变成 Base64 代码存起来
      };
      reader.readAsDataURL(file);
    }
  }

  // 🌟 5. 处理 Focus Areas 标签
  addTag(event: any) {
    const value = event.target.value.trim();
    if (value && !this.userProfile.focusAreas.includes(value)) {
      this.userProfile.focusAreas.push(value);
    }
    event.target.value = ''; // 清空输入框
  }

  removeTag(tag: string) {
    this.userProfile.focusAreas = this.userProfile.focusAreas.filter((t: string) => t !== tag);
  }

  // 🌟 刷新动画 (因为切换模式时 DOM 改变了)
  refreshAnimations() {
    setTimeout(() => {
      if (typeof AOS !== 'undefined') {
        AOS.init({ duration: 800, once: true, offset: 50 });
        AOS.refreshHard();
        window.scrollTo(0, 0);
      }
    }, 100);
  }

  // ==========================================
  // 🚀 Canvas 粒子背景 (同 Dashboard)
  // ==========================================
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
