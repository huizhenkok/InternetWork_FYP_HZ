import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, HostListener, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UploadService } from '../../../services/upload.service';
import { CmsService } from '../../../services/cms.service'; // 🌟 引入 CmsService

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

  // 🌟 存放从 CMS 抓取过来的下拉菜单选项
  availableDepartments: string[] = [];
  availableYears: string[] = [];

  userProfile: any = {
    fullName: '',
    email: '',
    role: '',
    matricNumber: '',
    phone: '',
    avatar: 'https://ui-avatars.com/api/?name=User&background=random',
    researchInterests: '',
    focusAreas: [],
    jobTitle: '',
    company: '',
    bio: '',          // 🌟 新增：个人简介 / 研究描述
    socialLink: '',   // 🌟 新增：社交链接 / 作品集
    department: ''    // 🌟 核心：用于存储选择的部门或年份
  };

  @ViewChild('particleCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D | null;
  private particles: any[] = [];
  private animationFrameId: number = 0;

  selectedFile: File | null = null;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private uploadService: UploadService,
    private cmsService: CmsService // 🌟 注入
  ) {}

  ngOnInit() {
    this.loadProfile();
    this.fetchCmsOptions(); // 🌟 页面加载时去抓取 CMS 选项
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.initParticles();
      this.refreshAnimations();
    }
  }

  // 🌟 从 CMS 抓取部门和年份，变成下拉菜单选项！
  fetchCmsOptions() {
    if (isPlatformBrowser(this.platformId)) {
      this.cmsService.getCmsData('inwlab_cms_team').subscribe({
        next: (res: any) => {
          try {
            const parsed = JSON.parse(res.contentJson);
            if (parsed.ourTeam) {
              this.availableDepartments = parsed.ourTeam.map((sec: any) => sec.title);
            }
            if (parsed.alumni) {
              this.availableYears = parsed.alumni.map((yr: any) => yr.year);
            }
          } catch(e) { console.error("Error fetching CMS options", e); }
        }
      });
    }
  }

  sanitizeData() {
    if (!this.userProfile) return;

    if (this.userProfile.focusAreas === null || this.userProfile.focusAreas === undefined) {
      this.userProfile.focusAreas = [];
    } else if (typeof this.userProfile.focusAreas === 'string') {
      try {
        const parsed = JSON.parse(this.userProfile.focusAreas);
        this.userProfile.focusAreas = Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        this.userProfile.focusAreas = [];
      }
    }
    if (!Array.isArray(this.userProfile.focusAreas)) {
      this.userProfile.focusAreas = [];
    }

    this.userProfile.researchInterests = this.userProfile.researchInterests || '';
    this.userProfile.jobTitle = this.userProfile.jobTitle || '';
    this.userProfile.company = this.userProfile.company || '';
    this.userProfile.bio = this.userProfile.bio || '';               // 🌟 保底防空
    this.userProfile.socialLink = this.userProfile.socialLink || ''; // 🌟 保底防空
    this.userProfile.department = this.userProfile.department || ''; // 🌟 保底防空
    this.userProfile.avatar = this.userProfile.avatar || 'https://ui-avatars.com/api/?name=User&background=random';
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
    this.sanitizeData();
  }

  toggleEditMode(status: boolean) {
    this.isEditMode = status;
    this.newTagValue = '';
    this.selectedFile = null;
    if (!status) {
      this.loadProfile();
    }
    this.refreshAnimations();
  }

  onFileSelected(event: any) {
    const file = event?.target?.files?.[0];
    if (file) {
      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        if (e?.target?.result) {
          this.userProfile.avatar = e.target.result;
        }
      };
      reader.readAsDataURL(file);
    }
  }

  saveProfile() {
    this.sanitizeData();

    if (!this.userProfile.fullName || !this.userProfile.fullName.trim()) {
      alert("Full Name cannot be empty.");
      return;
    }

    if (this.newTagValue && this.newTagValue.trim()) {
      this.addTag();
    }

    if (this.selectedFile) {
      this.uploadService.uploadFile(this.selectedFile).subscribe({
        next: (res: any) => {
          if (res && res.url) {
            this.userProfile.avatar = res.url;
          }
          this.sendDataToServer();
        },
        error: () => {
          alert("Failed to upload profile picture. Please try again.");
        }
      });
    } else {
      this.sendDataToServer();
    }
  }

  sendDataToServer() {
    fetch('https://internetworks.my/api/users/update', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(this.userProfile)
    }).then(response => {
      if(response.ok) {
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
    this.sanitizeData();
    const value = this.newTagValue?.trim();
    if (value && !this.userProfile.focusAreas.includes(value)) {
      this.userProfile.focusAreas = [...this.userProfile.focusAreas, value];
    }
    this.newTagValue = '';
  }

  removeTag(tag: string) {
    this.sanitizeData();
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
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;
    this.ctx = canvas.getContext('2d');
    if (!this.ctx) return;
    this.resizeCanvas();
    this.createParticles();
    this.animateParticles();
  }

  @HostListener('window:resize')
  resizeCanvas() {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  createParticles() {
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;
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
    const canvas = this.canvasRef?.nativeElement;
    if (!canvas) return;

    this.ctx.clearRect(0, 0, canvas.width, canvas.height);
    const isDark = document.documentElement?.classList?.contains('dark');
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
