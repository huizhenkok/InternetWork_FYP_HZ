import { Component, OnInit, AfterViewInit, ViewChild, ElementRef, HostListener, Inject, PLATFORM_ID, NgZone } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookingModal } from './booking-modal/booking-modal';

declare var AOS: any;

@Component({
  selector: 'app-booking',
  standalone: true,
  imports: [CommonModule, FormsModule, BookingModal],
  templateUrl: './booking.html'
})
export class Booking implements OnInit, AfterViewInit {

  showHistory: boolean = false;

  isScheduleModalOpen: boolean = false;
  selectedScheduleRoom: any = null;
  currentRoomSchedule: any[] = [];

  searchQuery: string = '';
  statusFilter: string = 'All Statuses';
  floorFilter: string = 'All Floors';

  rooms: any[] = [];
  filteredRooms: any[] = [];
  myBookings: any[] = [];

  isBookingModalOpen: boolean = false;
  selectedRoomForBooking: any = null;

  @ViewChild('particleCanvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  private ctx!: CanvasRenderingContext2D | null;
  private particles: any[] = [];
  private animationFrameId: number = 0;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private ngZone: NgZone
  ) {}

  ngOnInit() {
    this.initData();
    if (isPlatformBrowser(this.platformId)) {
      this.refreshAnimations();
    }
  }

  ngAfterViewInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.initParticles();
    }
  }

  initData() {
    if (isPlatformBrowser(this.platformId)) {
      const storedRooms = localStorage.getItem('inwlab_rooms');
      if (storedRooms) {
        this.rooms = JSON.parse(storedRooms);

        // 🌟 【核心修复】自动修复旧的冗余数据
        let dataFixed = false;
        this.rooms.forEach(room => {
          // 如果发现有房间卡在旧版本的 'Occupied' 状态，强制恢复为 'Available'
          if (room.status === 'Occupied') {
            room.status = 'Available';
            dataFixed = true;
          }
        });

        // 如果做了修复，就重新保存到数据库
        if (dataFixed) {
          localStorage.setItem('inwlab_rooms', JSON.stringify(this.rooms));
        }

      } else {
        this.loadDefaultRooms();
      }
    } else {
      this.loadDefaultRooms();
    }

    this.applyFilters();
    this.loadMyBookings();
  }

  loadDefaultRooms() {
    this.rooms = [
      { id: '#101', name: 'Discussion Room A', floor: 'Floor 2', location: 'East Wing', capacity: 6, equipment: ['Whiteboard', 'Screen'], status: 'Available', cleanedTime: 'Today, 09:00 AM', icon: 'meeting_room', color: 'teal' },
      { id: '#205', name: 'Computer Lab 1', floor: 'Floor 3', location: 'Tech Hub', capacity: 30, equipment: ['High-Spec PCs'], status: 'Available', cleanedTime: 'Yesterday, 18:00 PM', icon: 'computer', color: 'slate' },
      { id: '#310', name: 'IoT Workbench 4', floor: 'Basement Lab', location: 'Maker Space', capacity: 2, equipment: ['Soldering Station', 'Oscilloscope'], status: 'Available', cleanedTime: 'Today, 06:00 AM', icon: 'memory', color: 'cyan' },
      { id: '#404', name: 'Server Room Access', floor: 'Basement Lab', location: 'Secure Zone', capacity: 0, equipment: ['Restricted Access'], status: 'Maintenance', cleanedTime: '2 days ago', icon: 'dns', color: 'orange' }
    ];
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('inwlab_rooms', JSON.stringify(this.rooms));
    }
  }

  loadMyBookings() {
    if (isPlatformBrowser(this.platformId)) {
      const activeUser = JSON.parse(localStorage.getItem('active_user') || '{}');
      const allBookings = JSON.parse(localStorage.getItem('inwlab_bookings') || '[]');
      this.myBookings = allBookings.filter((b: any) => b.userEmail === activeUser.email);
    } else {
      this.myBookings = [];
    }
  }

  applyFilters() {
    this.filteredRooms = this.rooms.filter(room => {
      const searchLower = this.searchQuery.toLowerCase();
      const matchSearch = room.name.toLowerCase().includes(searchLower) ||
        room.id.toLowerCase().includes(searchLower) ||
        room.equipment.some((eq: string) => eq.toLowerCase().includes(searchLower));
      const matchStatus = this.statusFilter === 'All Statuses' || room.status === this.statusFilter;
      const matchFloor = this.floorFilter === 'All Floors' || room.floor === this.floorFilter;
      return matchSearch && matchStatus && matchFloor;
    });
  }

  toggleHistory() {
    this.showHistory = !this.showHistory;
    if (isPlatformBrowser(this.platformId)) {
      this.refreshAnimations();
    }
  }

  openBookingModal(room: any) {
    if (room.status !== 'Available') {
      alert("This facility is currently unavailable for booking.");
      return;
    }
    this.selectedRoomForBooking = room;
    this.isBookingModalOpen = true;
  }

  onBookingComplete() {
    this.isBookingModalOpen = false;
    this.initData();
  }

  openSchedule(room: any) {
    this.selectedScheduleRoom = room;

    if (isPlatformBrowser(this.platformId)) {
      const allBookings = JSON.parse(localStorage.getItem('inwlab_bookings') || '[]');
      const roomBookings = allBookings.filter((b: any) => b.roomId === room.id);

      if (roomBookings.length > 0) {
        this.currentRoomSchedule = roomBookings.map((b: any) => ({
          date: b.date,
          time: `${b.startTime} - ${b.endTime}`,
          label: `Occupied (${b.userName})`,
          isAvailable: false
        }));
      } else {
        this.currentRoomSchedule = [];
      }
    }

    this.isScheduleModalOpen = true;
  }

  refreshAnimations() {
    this.ngZone.runOutsideAngular(() => {
      setTimeout(() => {
        if (typeof AOS !== 'undefined') { AOS.init({ duration: 800, once: true, offset: 50 }); AOS.refreshHard(); }
      }, 100);
    });
  }

  initParticles() {
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
