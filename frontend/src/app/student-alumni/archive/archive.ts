import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, HostListener, Inject, PLATFORM_ID, NgZone } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CmsService } from '../../../services/cms.service'; // 🌟 引入 CmsService

declare var AOS: any;

@Component({
  selector: 'app-archive',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './archive.html'
})
export class Archive implements OnInit, AfterViewInit {

  publicPapers: any[] = [];
  filteredPapers: any[] = [];
  searchQuery: string = '';

  @ViewChild('particleCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D | null;
  private particles: any[] = [];
  private animationFrameId: number = 0;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private ngZone: NgZone,
    private cmsService: CmsService // 🌟 注入 CmsService
  ) {}

  ngOnInit() {
    this.loadPublicPapers();
    if (isPlatformBrowser(this.platformId)) {
      this.refreshAnimations();
    }
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.initParticles();
    }
  }

  loadPublicPapers() {
    if (isPlatformBrowser(this.platformId)) {
      // 🌟 从 MySQL 数据库拉取所有上传的文档
      this.cmsService.getCmsData('inwlab_publications').subscribe({
        next: (res: any) => {
          try {
            const allImports = JSON.parse(res.contentJson);
            this.publicPapers = allImports
              .filter((doc: any) => doc.visibility === 'Public')
              .sort((a: any, b: any) => b.timestamp - a.timestamp);
            this.filteredPapers = [...this.publicPapers];
          } catch(e) {
            console.error("Error parsing Publications CMS", e);
            this.publicPapers = [];
            this.filteredPapers = [];
          }
        },
        error: () => {
          this.publicPapers = [];
          this.filteredPapers = [];
        }
      });
    }
  }

  searchPapers() {
    const query = this.searchQuery.toLowerCase();
    this.filteredPapers = this.publicPapers.filter(paper =>
      paper.fileName.toLowerCase().includes(query) ||
      paper.authorName.toLowerCase().includes(query) ||
      paper.authorRole.toLowerCase().includes(query)
    );
  }

  // 🌟 核心修复：把假弹窗换成了真实的下载逻辑！
  downloadMock(fileName: string) {
    // 根据你点击的文件名，从数组里找到它对应的真实对象
    const paper = this.filteredPapers.find(p => p.fileName === fileName);

    // 如果找到了且有真实的 URL，就在新标签页打开/下载它
    if (paper && paper.fileUrl) {
      window.open(paper.fileUrl, '_blank');
    } else {
      // 备用方案，防止旧的脏数据没有 URL 导致报错
      alert(`Downloading ${fileName} from INWLab Secure Archive...`);
    }
  }

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
    this.ngZone.runOutsideAngular(() => this.animateParticles());
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
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
      if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

      this.ctx.beginPath();
      this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fillStyle = `rgba(${rgb}, 0.5)`;
      this.ctx.fill();

      for (let j = i + 1; j < this.particles.length; j++) {
        const p2 = this.particles[j];
        const dx = p.x - p2.x;
        const dy = p.y - p2.y;

        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 120) {
          this.ctx.beginPath();
          this.ctx.moveTo(p.x, p.y);
          this.ctx.lineTo(p2.x, p2.y);
          this.ctx.strokeStyle = `rgba(${rgb}, ${1 - distance / 120})`;
          this.ctx.lineWidth = 0.5;
          this.ctx.stroke();
        }
      }
    }
    this.animationFrameId = requestAnimationFrame(() => this.animateParticles());
  }
}
