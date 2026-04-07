import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, HostListener, Inject, PLATFORM_ID, NgZone } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';

declare var AOS: any;

@Component({
  selector: 'app-forum-activity',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './forum-activity.html'
})
export class ForumActivity implements OnInit, AfterViewInit {

  currentUser: any = {
    fullName: 'Unknown Scholar',
    role: 'Member',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuB0LswD0_6irjogIzA3SEKVww65eL9MDC5InK_ldo0TgrBDvcOlxglRnAHQap3CUDcsYblW9c8yug3byVje8c9h7svi3qK3Gx6PvFWJeBVPSGjSSC0DX7lN9ZjRCIgL2EpEdS1poq11nRv9VH-I90CYqx740GMVe1Ig4StAHOZRz3SphaRhNlOpTVhMChLa_iKqvy5nnfxOaRLwKc7rDI8slIvuHePon6eaKctGadtuI857f0fI74GvSCsWduEp0gWbP72OaeKera6z'
  };

  topics: any[] = [];
  activeTopic: any = null;

  newReplyText: string = '';
  newReplyImage: string | null = null;

  isCreatingTopic: boolean = false;
  newTopicTitle: string = '';
  newTopicCategory: string = 'Research';
  newTopicContent: string = '';

  // 🌟 修复：把 static 设为 true，确保初始化时就能抓到 Canvas
  @ViewChild('particleCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D | null;
  private particles: any[] = [];
  private animationFrameId: number = 0;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    this.loadCurrentUser();
    this.loadTopics();
    if (isPlatformBrowser(this.platformId)) {
      this.refreshAnimations();
    }
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.initParticles();
    }
  }

  @HostListener('window:storage', ['$event'])
  onStorageChange(event: StorageEvent) {
    if (event.key === 'inwlab_forum_topics') {
      this.ngZone.run(() => {
        this.loadTopics();
        if (this.activeTopic) {
          this.activeTopic = this.topics.find(t => t.id === this.activeTopic.id);
        }
      });
    }
  }

  loadCurrentUser() {
    if (isPlatformBrowser(this.platformId)) {
      const activeStr = localStorage.getItem('active_user');
      if (activeStr) {
        const user = JSON.parse(activeStr);
        this.currentUser = {
          fullName: user.fullName || 'Scholar',
          role: user.role || 'Member',
          avatar: user.avatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuB0LswD0_6irjogIzA3SEKVww65eL9MDC5InK_ldo0TgrBDvcOlxglRnAHQap3CUDcsYblW9c8yug3byVje8c9h7svi3qK3Gx6PvFWJeBVPSGjSSC0DX7lN9ZjRCIgL2EpEdS1poq11nRv9VH-I90CYqx740GMVe1Ig4StAHOZRz3SphaRhNlOpTVhMChLa_iKqvy5nnfxOaRLwKc7rDI8slIvuHePon6eaKctGadtuI857f0fI74GvSCsWduEp0gWbP72OaeKera6z'
        };
      }
    }
  }

  loadTopics() {
    if (isPlatformBrowser(this.platformId)) {
      const stored = localStorage.getItem('inwlab_forum_topics');
      if (stored) {
        this.topics = JSON.parse(stored);
      } else {
        this.topics = [
          {
            id: 1,
            title: 'Discussion: Implementing Zero-Knowledge Proofs in IoT Networks',
            category: 'Cryptography',
            authorName: 'Prof. Alan Turing',
            authorRole: 'Faculty',
            authorAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCfMaSTme0-Xx9Ez-NJMjo7uHJ3PV5lt1hBU3JAhgzgdC40mxRxpaJ4g98ha0kYddAUwVUXx4nZi78cm-ieT7fjmWNsSaFqIR6jOP67HfR1yin7bQ46uc6JxA-byPnI0Q-YhAjh5dj5FarG81yWQ7xRRb0p9_yo94CfukZ0SBiuwjpZtcZVJSq1YaioXcocYJx9njE8yUjtTe9A2z0wD8aLDZfyD-cfC4mfCiRBsFhi6HTUd59m3pAw8dH3DuQ5HlhovTNZQrxHo-M2',
            time: '2 hours ago',
            content: 'I\'ve been working on reducing computational overhead on edge devices for secure communications. Does anyone see potential optimizations for memory usage?',
            replies: [
              {
                id: 101,
                authorName: 'Sarah_PhD',
                authorRole: 'Student',
                authorAvatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuA3NlDT4u4GVRd1qdW2IqYwuqHD7MvZ9MkvYDbIcGVjBNAVOFDjtWs3SUSiQnAOXZlz6Km9C49O90GXLoMKCHJhlR7gLI1HDtwOc0dCzko20r5Nrz5TGaQjYT6SYsBiiT115GcfqbigfVeTeHFfvlm-lgZOgdci-1RaSEbTRHT9Jfm1K2690u4fEak7Mi-0v-YmnRVLKlVGN9fNEsgQ1UovpgDOWDtW8Jsw9eS5RrRBa--i1U-MxEwIU6w9le_9a8oqkJOyfb9AX_Cc',
                time: '1 hr ago',
                content: 'I tried this implementation on the Raspberry Pi cluster, but latency increased by 15% compared to the standard library.',
                image: null
              }
            ]
          }
        ];
        localStorage.setItem('inwlab_forum_topics', JSON.stringify(this.topics));
      }
      this.topics.sort((a, b) => b.id - a.id);
    }
  }

  saveDataAndSync() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('inwlab_forum_topics', JSON.stringify(this.topics));
    }
  }

  viewTopic(topic: any) {
    this.activeTopic = topic;
    this.refreshAnimations();
  }

  backToList() {
    this.activeTopic = null;
    this.newReplyText = '';
    this.newReplyImage = null;
    this.refreshAnimations();
  }

  toggleCreateTopic() {
    this.isCreatingTopic = !this.isCreatingTopic;
    this.newTopicTitle = '';
    this.newTopicContent = '';
  }

  submitNewTopic() {
    if (!this.newTopicTitle.trim() || !this.newTopicContent.trim()) {
      alert("Please enter both title and content.");
      return;
    }

    const newTopic = {
      id: Date.now(),
      title: this.newTopicTitle,
      category: this.newTopicCategory,
      authorName: this.currentUser.fullName,
      authorRole: this.currentUser.role,
      authorAvatar: this.currentUser.avatar,
      time: 'Just now',
      content: this.newTopicContent,
      replies: []
    };

    this.topics.unshift(newTopic);
    this.saveDataAndSync();
    this.isCreatingTopic = false;
    alert("Topic created successfully!");
  }

  onImageSelected(event: any) {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert("Image size should be less than 2MB for prototype database.");
        return;
      }
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.newReplyImage = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  removeAttachedImage() {
    this.newReplyImage = null;
  }

  postReply() {
    if (!this.newReplyText.trim() && !this.newReplyImage) return;

    const reply = {
      id: Date.now(),
      authorName: this.currentUser.fullName,
      authorRole: this.currentUser.role,
      authorAvatar: this.currentUser.avatar,
      time: 'Just now',
      content: this.newReplyText,
      image: this.newReplyImage
    };

    this.activeTopic.replies.push(reply);
    this.saveDataAndSync();

    this.newReplyText = '';
    this.newReplyImage = null;

    setTimeout(() => {
      window.scrollTo(0, document.body.scrollHeight);
    }, 100);
  }

  // ==========================================
  // 🚀 Canvas 粒子背景引擎
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

    // 🌟 防止 Angular SSR 报错
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
