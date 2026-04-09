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
  activeTab: string = 'news'; // 🌟 默认打开 News 方便测试
  editingLab: string = '';
  activeAboutTab: string = 'vision';
  activeTeamTab: string = 'team';

  // ==============================
  // 🗄️ 全局数据库映射
  // ==============================
  homeData: any = { heading: 'Innovating the Future...', subheading: '...', announcement: '...', upcomingEvent: '...', upcomingEventDesc: '...', conferenceDate: '...', stats: {} };
  researchData: any = { mainTitle: 'Research Areas', subTitle: '...', domains: { cyber: {}, forensics: {}, iot: {}, ai: {}, cloud: {}, network: {} } };
  resourceData: any = { mainTitle: 'Public Publications', subTitle: '...', filterTitle: '...', projects: [] };
  aboutData: any = { visionMission: {}, objective: {}, philosophy: {} };
  teamData: any = { mainTitle: 'Leadership & Team', subTitle: '...', ourTeam: [], alumni: [], students: [] };

  // 🌟 核心新增：News & Events 数据结构
  newsAndEventsData: any = {
    mainTitle: 'NEWS',
    mainTitleHighlight: '& EVENTS',
    subTitle: 'Stay synchronized with our latest research breakthroughs, lab upgrades, and upcoming academic gatherings.',

    // 旗舰主推活动
    flagship: {
      badge: 'Flagship Event',
      date: 'NOV 6-7, 2026',
      location: 'ALOR SETAR',
      title: 'NETAPPS 2026 Summit',
      desc: 'Join us for an immersive discussion on the next horizon of decentralized protocols and network defense strategies.',
      icon: 'hub'
    },

    // 即将到来的活动列表
    gatheringsTitle: 'INCOMING GATHERINGS',
    gatherings: [
      {
        date: 'NOV 12', location: 'LAB A', title: 'Cyber Forensics Workshop',
        desc: 'Advanced techniques in digital evidence recovery and analysis for next-gen networks.', icon: 'security'
      },
      {
        date: 'DEC 05', location: 'VIRTUAL', title: 'PhD Thesis Defense: AI Ethics',
        desc: 'Defending the framework for ethical decision making in autonomous network agents.', icon: 'psychology'
      }
    ],

    // 侧边栏快速更新与名言
    quickUpdatesTitle: 'QUICK UPDATES',
    quickUpdates: [
      { tag: 'NEXT WEEK', text: 'Lab server maintenance scheduled.' },
      { tag: 'REMINDER', text: 'Call for papers deadline extended to Nov 1.' }
    ],
    quoteText: '"Innovation in networking is not just about speed, but securing the foundation of tomorrow\'s digital society."',
    quoteAuthor: 'INWLab Vision'
  };

  conferenceData: any = { mainTitle: 'INWLab Annual Conference 2026', subTitle: '...', dates: '...', registerFee: '...' };
  forumVisitorData: any = { mainTitle: 'INWLab Community Forum', subTitle: '...', newsTitle: '...' };
  contactData: any = { mainTitle: 'Get In Touch', email: 'contact@inwlab.edu', phone: '+1 (555) 123-4567', address: 'Engineering Building...' };

  rooms: any[] = []; topics: any[] = [];

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private ngZone: NgZone, private router: Router) {}

  ngOnInit() {
    this.loadAllData();
    if (isPlatformBrowser(this.platformId)) { setTimeout(() => { if (typeof AOS !== 'undefined') { AOS.init({ duration: 800, once: true, offset: 50 }); AOS.refreshHard(); } }, 100); }
  }

  loadAllData() {
    if (isPlatformBrowser(this.platformId)) {
      const activeUser = JSON.parse(localStorage.getItem('active_user') || '{}');
      if (activeUser.fullName) this.adminName = activeUser.fullName;

      const loadOrInit = (key: string, defaultData: any) => {
        const saved = localStorage.getItem(key);
        if (saved) return { ...defaultData, ...JSON.parse(saved) };
        localStorage.setItem(key, JSON.stringify(defaultData));
        return defaultData;
      };

      this.homeData = loadOrInit('inwlab_cms_home', this.homeData);

      const savedResearch = localStorage.getItem('inwlab_cms_research');
      if (savedResearch) {
        let parsed = JSON.parse(savedResearch);
        if (Array.isArray(parsed.domains) || !parsed.domains?.cyber) { parsed.domains = this.researchData.domains; }
        this.researchData = { ...this.researchData, ...parsed };
      } else {
        localStorage.setItem('inwlab_cms_research', JSON.stringify(this.researchData));
      }

      this.resourceData = loadOrInit('inwlab_cms_resource', this.resourceData);
      const legacyProjects = localStorage.getItem('inwlab_projects');
      if (legacyProjects && this.resourceData.projects.length === 2) { try { const parsedLegacy = JSON.parse(legacyProjects); if (parsedLegacy && parsedLegacy.length > 0) { this.resourceData.projects = parsedLegacy; } } catch(e) {} }

      this.aboutData = loadOrInit('inwlab_cms_about', this.aboutData);
      this.teamData = loadOrInit('inwlab_cms_team', this.teamData);

      // 🌟 加载 News 数据
      this.newsAndEventsData = loadOrInit('inwlab_cms_news_events', this.newsAndEventsData);

      this.conferenceData = loadOrInit('inwlab_cms_conference', this.conferenceData);
      this.forumVisitorData = loadOrInit('inwlab_cms_forum_visitor', this.forumVisitorData);
      this.contactData = loadOrInit('inwlab_cms_contact', this.contactData);

      const savedRooms = localStorage.getItem('inwlab_rooms');
      if (savedRooms) { this.rooms = JSON.parse(savedRooms); } else { this.rooms = [ { id: '#101', name: 'Discussion Room A', capacity: 6, status: 'Available' } ]; localStorage.setItem('inwlab_rooms', JSON.stringify(this.rooms)); }
      this.topics = JSON.parse(localStorage.getItem('inwlab_forum_topics') || '[]');
    }
  }

  saveModule(key: string, data: any, moduleName: string) {
    if (isPlatformBrowser(this.platformId)) { localStorage.setItem(key, JSON.stringify(data)); alert(`✅ ${moduleName} updated successfully! Visitors will see this instantly.`); }
  }

  saveHome() { this.saveModule('inwlab_cms_home', this.homeData, 'Home Page'); }
  saveResearch() { this.saveModule('inwlab_cms_research', this.researchData, 'Research Area'); }
  saveResource() { this.saveModule('inwlab_cms_resource', this.resourceData, 'Publication & Projects'); if (isPlatformBrowser(this.platformId)) { localStorage.setItem('inwlab_projects', JSON.stringify(this.resourceData.projects)); } }
  saveAbout() { this.saveModule('inwlab_cms_about', this.aboutData, 'About Us Information'); }
  saveTeam() { this.saveModule('inwlab_cms_team', this.teamData, 'Team & Leadership Directory'); }

  // 🌟 保存 News 数据
  saveNews() { this.saveModule('inwlab_cms_news_events', this.newsAndEventsData, 'News & Events'); }

  // 🌟 News 管理方法
  addGathering() { this.newsAndEventsData.gatherings.push({ date: 'DATE', location: 'LOCATION', title: 'New Event Title', desc: 'Event description.', icon: 'event' }); }
  deleteGathering(index: number) { if (confirm("Remove this gathering?")) this.newsAndEventsData.gatherings.splice(index, 1); }

  addQuickUpdate() { this.newsAndEventsData.quickUpdates.push({ tag: 'NEW TAG', text: 'New update text here.' }); }
  deleteQuickUpdate(index: number) { if (confirm("Remove this update?")) this.newsAndEventsData.quickUpdates.splice(index, 1); }

  // ... (保留其他原有的增删代码) ...
  addTeamSection() { this.teamData.ourTeam.push({ title: 'New Department', members: [] }); }
  deleteTeamSection(index: number) { if (confirm("Delete this entire department?")) this.teamData.ourTeam.splice(index, 1); }
  addTeamMember(sectionIndex: number) { this.teamData.ourTeam[sectionIndex].members.push({ name: 'New Member', role: 'Role', email: '', socialLink: '', avatar: '' }); }
  deleteTeamMember(sectionIndex: number, memberIndex: number) { if (confirm("Remove this member?")) this.teamData.ourTeam[sectionIndex].members.splice(memberIndex, 1); }
  addAlumniYear() { this.teamData.alumni.unshift({ year: new Date().getFullYear().toString(), members: [] }); }
  deleteAlumniYear(index: number) { if (confirm("Delete this entire class year?")) this.teamData.alumni.splice(index, 1); }
  addAlumniMember(yearIndex: number) { this.teamData.alumni[yearIndex].members.push({ name: 'New Alumni', designation: 'Job Title', organization: 'Company / Uni', avatar: '' }); }
  deleteAlumniMember(yearIndex: number, memberIndex: number) { if (confirm("Remove this alumni?")) this.teamData.alumni[yearIndex].members.splice(memberIndex, 1); }
  addStudent() { this.teamData.students.unshift({ name: 'New Student', department: 'MSc / PhD Program', email: '', avatar: '' }); }
  deleteStudent(index: number) { if (confirm("Remove this student?")) this.teamData.students.splice(index, 1); }
  addProject() { this.resourceData.projects.unshift({ id: new Date().getTime(), title: 'New Research Project', name: 'Researcher Name', date: new Date().toISOString().split('T')[0], summary: 'Enter project description here.' }); }
  deleteProject(index: number) { if (confirm("Delete this project permanently?")) { this.resourceData.projects.splice(index, 1); } }
  saveContact() { this.saveModule('inwlab_cms_contact', this.contactData, 'Contact Info'); }
  saveRooms() { if (isPlatformBrowser(this.platformId)) { localStorage.setItem('inwlab_rooms', JSON.stringify(this.rooms)); alert("✅ Lab Facilities updated!"); } }
  addNewRoom() { this.rooms.push({ id: '#'+Math.floor(Math.random()*900+100), name: 'New Room', capacity: 10, status: 'Available' }); }
  deleteRoom(index: number) { if (confirm("Delete this facility?")) this.rooms.splice(index, 1); }
  deleteTopic(index: number) { if (confirm("Delete this topic?")) { this.topics.splice(index, 1); if (isPlatformBrowser(this.platformId)) localStorage.setItem('inwlab_forum_topics', JSON.stringify(this.topics)); } }
  logout() { if (confirm("Are you sure you want to logout?")) { localStorage.removeItem('active_user'); this.router.navigate(['/login']); } }
  goToLabEditor(labId: string) { this.editingLab = labId; }
  backToResearchMain() { this.editingLab = ''; }
}
