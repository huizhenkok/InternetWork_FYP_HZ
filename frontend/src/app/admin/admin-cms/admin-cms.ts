import { Component, OnInit, Inject, PLATFORM_ID, NgZone } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

declare var AOS: any;

@Component({
  selector: 'app-admin-cms',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './admin-cms.html'
})
export class AdminCms implements OnInit {

  adminName: string = 'System Admin';
  activeTab: string = 'home';

  // ==============================
  // 🗄️ 全局数据库映射 (State Models)
  // ==============================

  // 1. Visitor: Home
  homeData = {
    heading: 'Innovating the Future of Network Technology',
    subheading: 'Join INWLab to explore cutting-edge research in 5G/6G, IoT security, and decentralized computing architectures.',
    announcement: '🎉 New Paper Published: Optimizing zk-SNARKs for Edge Devices.',
    upcomingEvent: 'Annual Cyber Defense Symposium (Nov 15)',
    stats: {
      publications: '124+',
      projects: '18',
      members: '45+',
      excellence: '10 Yrs'
    }
  };

  // 2. Visitor: Research
  researchData = {
    mainTitle: 'Pioneering the Next Generation of Networks',
    subTitle: 'Explore our core research domains and breakthrough projects.',
    domains: [
      { name: 'Cybersecurity & Defense', desc: 'Advanced cryptographic protocols.' },
      { name: 'Digital Forensics', desc: 'Tracing cyber footprints.' },
      { name: 'IoT Architecture', desc: 'Scalable node networks.' }
    ]
  };

  // 3. Visitor: Resources
  resourceData = {
    mainTitle: 'Academic Resources & Datasets',
    subTitle: 'Access tools, manuals, and open datasets for your research.',
    categories: ['All Resources', 'Cybersecurity', 'IoT', 'Datasets']
  };

  // 4. Visitor: People
  peopleData = {
    mainTitle: 'The Minds Behind INWLab',
    subTitle: 'Meet our dedicated team of researchers, faculty, and alumni.',
    director: { name: 'Prof. Alan Turing', role: 'Lab Director', expertise: 'Cryptography' }
  };

  // 5. Visitor: News & Events
  newsData = {
    mainTitle: 'Lab Updates & Bulletins',
    featureSignal: '🚨 Critical Update',
    quickUpdatesTitle: 'Quick Updates'
  };

  // 6. Visitor: Conference
  conferenceData = {
    mainTitle: 'INWLab Annual Conference 2026',
    subTitle: 'Shaping the Future of Secure Connectivity',
    dates: 'Dec 10 - 12, 2026',
    registerFee: '$299'
  };

  // 7. Visitor: Forum Info
  forumVisitorData = {
    mainTitle: 'INWLab Community Forum',
    subTitle: 'Join the discussion, share ideas, and solve problems.',
    newsTitle: 'Forum Guidelines Updated'
  };

  // 8. Visitor: Contact
  contactData = {
    mainTitle: 'Get In Touch',
    email: 'contact@inwlab.edu',
    phone: '+1 (555) 123-4567',
    address: 'Engineering Building, Floor 3\nUniversity Campus'
  };

  // 9. Internal: System Bulletins
  bulletins: any[] = [];

  // 10. Internal: Rooms
  rooms: any[] = [];

  // 11. Internal: Forum Topics
  topics: any[] = [];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private ngZone: NgZone,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadAllData();
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        if (typeof AOS !== 'undefined') { AOS.init({ duration: 800, once: true, offset: 50 }); AOS.refreshHard(); }
      }, 100);
    }
  }

  loadAllData() {
    if (isPlatformBrowser(this.platformId)) {
      const activeUser = JSON.parse(localStorage.getItem('active_user') || '{}');
      if (activeUser.fullName) this.adminName = activeUser.fullName;

      // 读取各种配置，如果没有就使用默认值写入数据库
      const loadOrInit = (key: string, defaultData: any) => {
        const saved = localStorage.getItem(key);
        if (saved) return JSON.parse(saved);
        localStorage.setItem(key, JSON.stringify(defaultData));
        return defaultData;
      };

      this.homeData = loadOrInit('inwlab_cms_home', this.homeData);
      this.researchData = loadOrInit('inwlab_cms_research', this.researchData);
      this.resourceData = loadOrInit('inwlab_cms_resource', this.resourceData);
      this.peopleData = loadOrInit('inwlab_cms_people', this.peopleData);
      this.newsData = loadOrInit('inwlab_cms_news', this.newsData);
      this.conferenceData = loadOrInit('inwlab_cms_conference', this.conferenceData);
      this.forumVisitorData = loadOrInit('inwlab_cms_forum_visitor', this.forumVisitorData);
      this.contactData = loadOrInit('inwlab_cms_contact', this.contactData);

      // Rooms
      const savedRooms = localStorage.getItem('inwlab_rooms');
      if (savedRooms) {
        this.rooms = JSON.parse(savedRooms);
      } else {
        this.rooms = [
          { id: '#101', name: 'Discussion Room A', capacity: 6, status: 'Available' },
          { id: '#205', name: 'Computer Lab 1', capacity: 30, status: 'Available' }
        ];
        localStorage.setItem('inwlab_rooms', JSON.stringify(this.rooms));
      }

      // Topics & Bulletins
      this.topics = JSON.parse(localStorage.getItem('inwlab_forum_topics') || '[]');
      this.bulletins = JSON.parse(localStorage.getItem('inwlab_bulletins') || '[]');
    }
  }

  // ==============================
  // 💾 保存模块函数
  // ==============================
  saveModule(key: string, data: any, moduleName: string) {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem(key, JSON.stringify(data));
      alert(`✅ ${moduleName} updated successfully! Visitors will see this instantly.`);
    }
  }

  saveHome() { this.saveModule('inwlab_cms_home', this.homeData, 'Home Page'); }
  saveResearch() { this.saveModule('inwlab_cms_research', this.researchData, 'Research Area'); }
  saveContact() { this.saveModule('inwlab_cms_contact', this.contactData, 'Contact Info'); }

  saveRooms() {
    if (isPlatformBrowser(this.platformId)) {
      localStorage.setItem('inwlab_rooms', JSON.stringify(this.rooms));
      alert("✅ Lab Facilities updated!");
    }
  }
  addNewRoom() {
    this.rooms.push({ id: '#'+Math.floor(Math.random()*900+100), name: 'New Room', capacity: 10, status: 'Available' });
  }
  deleteRoom(index: number) {
    if (confirm("Delete this facility?")) this.rooms.splice(index, 1);
  }
  deleteTopic(index: number) {
    if (confirm("Delete this topic?")) {
      this.topics.splice(index, 1);
      if (isPlatformBrowser(this.platformId)) localStorage.setItem('inwlab_forum_topics', JSON.stringify(this.topics));
    }
  }

  logout() {
    if (confirm("Are you sure you want to logout?")) {
      localStorage.removeItem('active_user');
      this.router.navigate(['/login']);
    }
  }
}
