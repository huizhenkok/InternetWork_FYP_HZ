import { Component, OnInit, AfterViewInit, Inject, PLATFORM_ID, ViewChild, ElementRef, HostListener } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BookingService } from '../../services/booking.service'; // 🌟 Added BookingService
import { CmsService } from '../../services/cms.service'; // 🌟 Added CmsService

declare var AOS: any;

@Component({
  selector: 'app-student-alumni',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './student-alumni.html'
})
export class StudentAlumni implements OnInit, AfterViewInit {

  userRole: string = 'Student';
  userName: string = 'User';

  bulletins: any[] = [];
  myUpcomingBookings: any[] = [];

  @ViewChild('particleCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D | null;
  private particles: any[] = [];
  private animationFrameId: number = 0;

  constructor(
    private route: ActivatedRoute,
    @Inject(PLATFORM_ID) private platformId: Object,
    private bookingService: BookingService, // 🌟 Inject BookingService
    private cmsService: CmsService // 🌟 Inject CmsService
  ) {}

  ngOnInit() {
    this.route.data.subscribe(data => {
      if (data['role']) this.userRole = data['role'];
    });

    if (isPlatformBrowser(this.platformId)) {
      this.loadUserDataAndBookings();
      this.loadBulletins();

      setTimeout(() => {
        if (typeof AOS !== 'undefined') {
          AOS.init({ duration: 800, once: true, offset: 50 });
          AOS.refreshHard();
          window.scrollTo(0, 0);
        }
      }, 150);
    }
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) { this.initParticles(); }
  }

  loadUserDataAndBookings() {
    try {
      // User session data remains in localStorage (intended behavior for Auth)
      const activeUserStr = localStorage.getItem('active_user');
      if (!activeUserStr) return;

      const activeUser = JSON.parse(activeUserStr);
      if (activeUser && activeUser.fullName) {
        this.userName = activeUser.fullName.split(' ')[0];
        if (activeUser.role) this.userRole = activeUser.role;

        // 🌟 Fetch Rooms (for icons) and Bookings from MySQL
        this.cmsService.getCmsData('inwlab_rooms').subscribe({
          next: (resRoom: any) => {
            let allRooms: any[] = [];
            try { allRooms = JSON.parse(resRoom.contentJson); } catch(e) {}

            this.bookingService.getAllBookings().subscribe({
              next: (allBookings: any[]) => {
                this.myUpcomingBookings = allBookings
                  .filter((b: any) => b.userEmail === activeUser.email && b.status === 'Approved')
                  .map((b: any) => {
                    // Match room to get its icon (Backend uses roomName)
                    const roomInfo = allRooms.find((r: any) => r.name === b.roomName);
                    return {
                      ...b,
                      icon: roomInfo && roomInfo.icon ? roomInfo.icon : 'meeting_room'
                    };
                  })
                  .sort((a: any, b: any) => new Date(a.bookingDate).getTime() - new Date(b.bookingDate).getTime())
                  .slice(0, 3);
              },
              error: (err) => console.error("Error fetching bookings:", err)
            });
          },
          error: (err) => console.error("Error fetching rooms for icons:", err)
        });
      }
    } catch (e) { console.error(e); }
  }

  loadBulletins() {
    // 🌟 Fetch Bulletins from MySQL CMS
    this.cmsService.getCmsData('inwlab_bulletins').subscribe({
      next: (res: any) => {
        try {
          this.bulletins = JSON.parse(res.contentJson);
          if (!this.bulletins || this.bulletins.length === 0) this.applyDefaultBulletins();
        } catch(e) {
          console.error("Error parsing Bulletins CMS", e);
          this.applyDefaultBulletins();
        }
      },
      error: () => this.applyDefaultBulletins()
    });
  }

  applyDefaultBulletins() {
    this.bulletins = [
      { title: 'Main Server Maintenance', dateLabel: 'Today', content: 'The SOC database cluster will be down for scheduled upgrades from 2:00 AM to 4:00 AM. Please save your simulations.', icon: 'dns', color: 'red' },
      { title: 'New IoT Equipment Arrived', dateLabel: 'Yesterday', content: 'Ten new Raspberry Pi 5 nodes have been added to the hardware lab. You can reserve them starting next Monday.', icon: 'science', color: 'primary' }
    ];
  }

  // ================= Particle Engine =================
  initParticles() {
    const canvas = this.canvasRef.nativeElement;
    this.ctx = canvas.getContext('2d');
    if (!this.ctx) return;
    this.resizeCanvas(); this.createParticles(); this.animateParticles();
  }

  @HostListener('window:resize')
  resizeCanvas() {
    if (!this.canvasRef) return;
    const canvas = this.canvasRef.nativeElement;
    canvas.width = window.innerWidth; canvas.height = window.innerHeight;
  }

  createParticles() {
    const canvas = this.canvasRef.nativeElement;
    const particleCount = window.innerWidth < 768 ? 40 : 80;
    this.particles = [];
    for (let i = 0; i < particleCount; i++) {
      this.particles.push({
        x: Math.random() * canvas.width, y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.8, vy: (Math.random() - 0.5) * 0.8, radius: Math.random() * 2 + 1
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
