import { Component, OnInit, AfterViewInit, Inject, PLATFORM_ID, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

declare var AOS: any;

@Component({
  selector: 'app-student-alumni',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './student-alumni.html'
})
export class StudentAlumni implements OnInit, AfterViewInit {

  userRole: string = 'Researcher';
  userName: string = 'User';

  // 🌟 获取 HTML 里的 Canvas 元素
  @ViewChild('particleCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D | null;
  private particles: any[] = [];
  private animationFrameId: number = 0;

  constructor(
    private route: ActivatedRoute,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    this.route.data.subscribe(data => {
      if (data['role']) this.userRole = data['role'];
    });

    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        if (typeof AOS !== 'undefined') {
          AOS.init({ duration: 800, once: true, offset: 50 });
          AOS.refreshHard();
          window.scrollTo(0, 0);
        }
      }, 150);

      this.loadUserData();
    }
  }

  // 🌟 视图加载完毕后，启动粒子引擎
  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.initParticles();
    }
  }

  loadUserData() {
    try {
      const activeUserStr = localStorage.getItem('active_user');
      if (activeUserStr) {
        const activeUser = JSON.parse(activeUserStr);
        if (activeUser && activeUser.fullName) {
          this.userName = activeUser.fullName.split(' ')[0];
          if (activeUser.role) this.userRole = activeUser.role;
        }
      }
    } catch (e) {
      console.error("Error loading user session data", e);
    }
  }

  // ==========================================
  // 🚀 核心：超轻量 Canvas 粒子连线系统
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
    const particleCount = window.innerWidth < 768 ? 40 : 80; // 手机端少一点，电脑端多一点
    this.particles = [];

    for (let i = 0; i < particleCount; i++) {
      this.particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.8, // 移动速度 (X轴)
        vy: (Math.random() - 0.5) * 0.8, // 移动速度 (Y轴)
        radius: Math.random() * 2 + 1
      });
    }
  }

  animateParticles() {
    if (!this.ctx) return;
    const canvas = this.canvasRef.nativeElement;

    // 清空画布
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 判断当前是黑夜还是白昼，决定连线的颜色
    const isDark = document.documentElement.classList.contains('dark');
    const rgb = isDark ? '13, 242, 242' : '8, 145, 178'; // 青色 / 深蓝色

    // 更新粒子位置并画点
    for (let i = 0; i < this.particles.length; i++) {
      let p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;

      // 碰到边缘反弹
      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(${rgb}, 0.5)`;
      this.ctx.fill();

      // 🌟 画连线：如果两个粒子距离足够近，就画一条线
      for (let j = i + 1; j < this.particles.length; j++) {
        let p2 = this.particles[j];
        let dx = p.x - p2.x;
        let dy = p.y - p2.y;
        let dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 120) { // 连线触发距离
          this.ctx.beginPath();
          this.ctx.moveTo(p.x, p.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.strokeStyle = `rgba(${rgb}, ${1 - dist / 120})`; // 距离越远线越淡
          this.ctx.lineWidth = 0.5;
          this.ctx.stroke();
        }
      }
    }

    // 循环动画
    this.animationFrameId = requestAnimationFrame(() => this.animateParticles());
  }
}
