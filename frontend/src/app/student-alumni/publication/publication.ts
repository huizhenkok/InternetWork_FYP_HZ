import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, HostListener, Inject, PLATFORM_ID, NgZone } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

declare var AOS: any;

@Component({
  selector: 'app-publication',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './publication.html'
})
export class Publication implements OnInit, AfterViewInit {

  // 动态数据
  isDragging: boolean = false;
  recentImports: any[] = [];
  currentUserEmail: string = '';

  // 粒子引擎相关
  @ViewChild('particleCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D | null;
  private particles: any[] = [];
  private animationFrameId: number = 0;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    this.loadImports();
    if (isPlatformBrowser(this.platformId)) {
      this.refreshAnimations();
    }
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.initParticles();
    }
  }

  // 🌟 读取上传历史记录
  loadImports() {
    if (isPlatformBrowser(this.platformId)) {
      const activeUser = JSON.parse(localStorage.getItem('active_user') || '{}');
      this.currentUserEmail = activeUser.email;

      const allImports = JSON.parse(localStorage.getItem('inwlab_publications') || '[]');
      // 只过滤出当前用户自己上传的文件，并且最新的排在前面
      this.recentImports = allImports
        .filter((doc: any) => doc.userEmail === this.currentUserEmail)
        .sort((a: any, b: any) => b.timestamp - a.timestamp);
    }
  }

  // ==========================================
  // 🌟 拖拽与上传文件逻辑
  // ==========================================

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      this.handleFiles(event.dataTransfer.files);
    }
  }

  onFileSelect(event: any) {
    if (event.target.files.length > 0) {
      this.handleFiles(event.target.files);
    }
  }

  handleFiles(files: FileList) {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];

      // 检查文件后缀
      const validExtensions = ['pdf', 'bib', 'xml', 'doc', 'docx'];
      const fileExt = file.name.split('.').pop()?.toLowerCase();

      if (!fileExt || !validExtensions.includes(fileExt)) {
        alert(`Invalid format for file: ${file.name}. Only PDF, BIB, or XML allowed.`);
        continue;
      }

      // 检查文件大小 (假设上限为 50MB)
      if (file.size > 50 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Max size is 50MB.`);
        continue;
      }

      // 保存文件记录
      this.saveFileRecord(file.name);
    }
  }

  saveFileRecord(fileName: string) {
    if (isPlatformBrowser(this.platformId)) {
      const allImports = JSON.parse(localStorage.getItem('inwlab_publications') || '[]');

      const newRecord = {
        id: Date.now() + Math.random(),
        fileName: fileName,
        userEmail: this.currentUserEmail,
        timestamp: Date.now(),
        dateStr: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        status: 'Completed' // 模拟瞬间上传完成
      };

      allImports.push(newRecord);
      localStorage.setItem('inwlab_publications', JSON.stringify(allImports));

      // 重新加载列表显示出来
      this.loadImports();
      alert(`${fileName} uploaded successfully!`);
    }
  }

  // ==========================================
  // 🚀 Canvas 粒子连线背景
  // ==========================================
  refreshAnimations() {
    this.ngZone.runOutsideAngular(() => {
      setTimeout(() => {
        if (typeof AOS !== 'undefined') { AOS.init({ duration: 800, once: true, offset: 50 }); AOS.refreshHard(); }
      }, 100);
    });
  }

  initParticles() {
    if (!this.canvasRef) return;
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d');
    if (!this.ctx) return;
    this.resizeCanvas();
    this.createParticles();

    this.ngZone.runOutsideAngular(() => {
      this.animateParticles();
    });
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
        x: Math.random() * canvas.width, y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.8, vy: (Math.random() - 0.5) * 0.8,
        radius: Math.random() * 2 + 1
      });
    }
  }

  animateParticles() {
    if (!this.ctx || !this.canvasRef) return;
    const canvas = this.canvasRef.nativeElement;
    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    const isDark = document.documentElement.classList.contains('dark');
    const rgb = isDark ? '13, 242, 242' : '8, 145, 178';

    for (let i = 0; i < this.particles.length; i++) {
      let p = this.particles[i];
      p.x += p.vx; p.y += p.vy;
      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

      this.ctx.beginPath(); this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(${rgb}, 0.5)`; this.ctx.fill();

      for (let j = i + 1; j < this.particles.length; j++) {
        let p2 = this.particles[j];
        let dx = p.x - p2.x; let dy = p.y - p2.y;
        let dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          this.ctx.beginPath(); this.ctx.moveTo(p.x, p.y); this.ctx.lineTo(p2.x, p2.y);
          this.ctx.strokeStyle = `rgba(${rgb}, ${1 - dist / 120})`;
          this.ctx.lineWidth = 0.5; this.ctx.stroke();
        }
      }
    }
    this.animationFrameId = requestAnimationFrame(() => this.animateParticles());
  }
}
