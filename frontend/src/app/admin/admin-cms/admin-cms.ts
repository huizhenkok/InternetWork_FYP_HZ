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
  activeTab: string = 'people';

  // 🌟 核心修复：把 null 改成空字符串 ''，防止 TS 索引报错
  editingLab: string = '';

  activeAboutTab: string = 'vision';
  activeTeamTab: string = 'team';

  // ==============================
  // 🗄️ 全局数据库映射
  // ==============================

  homeData: any = {
    heading: 'Innovating the Future of Network Technology',
    subheading: 'Join INWLab to explore cutting-edge research in 5G/6G, IoT security, and decentralized computing architectures.',
    announcement: 'Leading Research Center',
    upcomingEvent: 'The 7th International Conference on Internet Applications, Protocols & Services',
    upcomingEventDesc: 'NETAPPS2024 is a premier platform to promote greater engagement of network researchers from around the globe...',
    conferenceDate: '2026-11-06T00:00:00',
    stats: { activePhds: '85+', globalAwards: '42', industryPartners: '200+' }
  };

  researchData: any = {
    mainTitle: 'Research Areas',
    subTitle: 'Our laboratory focuses on critical advancements in network security, digital forensics, and intelligent systems. We bridge the gap between theoretical models and real-world application.',
    domains: {
      cyber: {
        title: 'Cybersecurity & Defense', shortDesc: 'Advanced threat detection, penetration testing, and securing critical network infrastructures against modern cyber attacks.',
        labTitle: 'Cybersecurity & Defense Lab', longDesc: 'Dedicated to developing next-generation defense mechanisms against evolving digital threats.',
        lead: 'Dr. Sarah Connor', stat1Name: 'Active Projects', stat1Value: '12', stat2Name: 'Published Papers', stat2Value: '84+',
        focus1Title: 'Threat Intelligence', focus1Desc: 'Analyzing emerging malware strains and APT behaviors.', focus2Title: 'Zero-Trust Networks', focus2Desc: 'Designing continuous verification models.', focus3Title: 'Automated Pentesting', focus3Desc: 'Creating scripts and bots that autonomously simulate attacks.'
      },
      forensics: {
        title: 'Digital Forensics', shortDesc: 'Recovery and investigation of material found in digital devices.',
        labTitle: 'Digital Forensics Lab', longDesc: 'Uncovering the truth in the digital realm. We pioneer advanced methodologies for evidence recovery.',
        lead: 'Dr. Alan Turing', stat1Name: 'Active Cases', stat1Value: '8', stat2Name: 'Partners', stat2Value: '15+',
        focus1Title: 'Cybercrime Analysis', focus1Desc: 'Tracing digital footprints.', focus2Title: 'Mobile Forensics', focus2Desc: 'Extracting encrypted data.', focus3Title: 'Evidence Recovery', focus3Desc: 'Advanced physical and logical recovery.'
      },
      iot: {
        title: 'IoT & Smart Systems', shortDesc: 'Securing Internet of Things (IoT) ecosystems and developing resilient protocols.',
        labTitle: 'IoT & Smart Systems', longDesc: 'Connecting the physical and digital worlds. We focus on low-power communication protocols.',
        lead: 'Prof. James Watt', stat1Name: 'Sensors Deployed', stat1Value: '500+', stat2Name: 'Pilots', stat2Value: '4 Locations',
        focus1Title: 'Edge Computing', focus1Desc: 'Processing data locally.', focus2Title: 'LPWAN Protocols', focus2Desc: 'Researching LoRaWAN and NB-IoT.', focus3Title: 'IoT Security', focus3Desc: 'Developing lightweight encryption.'
      },
      ai: {
        title: 'Data Science & AI', shortDesc: 'Leveraging machine learning algorithms for big data analysis.',
        labTitle: 'Data Science & AI Lab', longDesc: 'Empowering systems with intelligence. We focus on Deep Learning and LLMs.',
        lead: 'Dr. Ada Lovelace', stat1Name: 'GPU Clusters', stat1Value: '24 Nodes', stat2Name: 'Algorithms', stat2Value: '120+',
        focus1Title: 'Deep Learning', focus1Desc: 'Developing advanced neural networks.', focus2Title: 'Predictive Modeling', focus2Desc: 'Using statistical algorithms.', focus3Title: 'Big Data', focus3Desc: 'Processing massive datasets.'
      },
      cloud: {
        title: 'Cloud Computing', shortDesc: 'Optimizing virtualization technologies and secure cloud storage architectures.',
        labTitle: 'Cloud Computing Lab', longDesc: 'Driving the evolution of scalable infrastructure.',
        lead: 'Dr. Cloud Strife', stat1Name: 'Storage Managed', stat1Value: '2.5 PB', stat2Name: 'Uptime', stat2Value: '99.99%',
        focus1Title: 'Containerization', focus1Desc: 'Optimizing Docker and Kubernetes workflows.', focus2Title: 'Serverless', focus2Desc: 'Reducing cold-start times.', focus3Title: 'Cloud Security', focus3Desc: 'Implementing advanced IAM.'
      },
      network: {
        title: 'Next-Gen Networking', shortDesc: 'Research into 5G/6G technologies and SDN.',
        labTitle: 'Next-Gen Networking Lab', longDesc: 'Redefining connectivity for the future.',
        lead: 'Dr. Nikola Tesla', stat1Name: 'Testbed Nodes', stat1Value: '40+ Switches', stat2Name: 'Latency Target', stat2Value: '< 1ms',
        focus1Title: '6G Wireless', focus1Desc: 'Exploring Terahertz frequency bands.', focus2Title: 'SDN & NFV', focus2Desc: 'Decoupling network control from hardware.', focus3Title: 'Network Slicing', focus3Desc: 'Virtualizing a single physical network.'
      }
    }
  };

  resourceData: any = {
    mainTitle: 'Public Publications',
    subTitle: 'Explore research papers, datasets, and technical reports publicly shared by INWLab members.',
    filterTitle: 'Select a category to filter our repository of publications, reports, and datasets.',
    projects: [
      { id: 1, title: 'Quantum Encryption Protocols', name: 'Dr. Aris Thorne', date: '2026-03-15', summary: 'Developing unbreakable communication lines using quantum entanglement mechanics for next-gen IoT networks.' },
      { id: 2, title: 'AI-Driven Threat Detection', name: 'Sarah Jenkins', date: '2026-04-02', summary: 'A machine learning model that analyzes network traffic behavior to instantly identify and quarantine zero-day malware attacks.' }
    ]
  };

  aboutData: any = {
    visionMission: { visionTitle: 'Our Vision', visionTextMalay: 'MENJADI UNIVERSITI PENGURUSAN TERKEMUKA', visionTextEnglish: '"To Be An Eminent Management University"', missionTitle: 'Our Mission', missionTextMalay: 'KAMI MENDIDIK PEMIMPIN BERPERWATAKAN HOLISTIK UNTUK BERBAKTI KEPADA KOMUNITI GLOBAL', missionTextEnglish: '"We educate leaders with holistic characteristics to serve the global community"' },
    objective: { mainTitle: 'University Objectives', paragraph1: 'Universiti Utara Malaysia was established to primarily develop and promote management education in the country.', paragraph2: 'Universiti Utara Malaysia also acts as a catalyst for socio-economic development.', paragraph3: 'In addition to its core business of providing quality teaching...', thrustsTitle: 'Three Major Thrusts', thrust1: 'To be the centre of excellence for management education.', thrust2: 'To be the leading referral centre in all aspects of management scholarship and practice.', thrust3: 'To be the premier resource centre in the field of management studies.' },
    philosophy: { mainTitle: 'Our Philosophy', point1: 'Cognizant of the fact that God will not change the destiny of a people until the people themselves endeavour to change it.', point2: 'Appreciating that Malaysia has been blessed with a wealth of both human and natural resources...', point3: 'Convinced that humankind cannot subsist merely on material progress...', point4: 'Universiti Utara Malaysia dedicates itself to producing well-rounded graduates...', mottoTitle: 'University Motto', mottoWord1: 'Knowledge,', mottoWord2: 'Virtue,', mottoWord3: 'Service' }
  };

  teamData: any = {
    mainTitle: 'Leadership & Team',
    subTitle: 'A dedicated team of academic professionals, post-graduate researchers, and alumni advancing the field of network intelligence.',
    ourTeam: [
      { title: 'Management Board', members: [ { name: 'Prof. Ts. Dr. Suhaidi Hasaan', role: 'Chairman', email: 'suhaidi@uum.edu.my', socialLink: 'https://linkedin.com', avatar: '' }, { name: 'Dr. Noradila Nordin', role: 'Secretariat', email: 'noradila@uum.edu.my', socialLink: '', avatar: '' } ] },
      { title: 'Activity Coordinators', members: [ { name: 'Dr. Mohd Nizam Omar', role: 'Activity Coordinator', email: '', socialLink: '', avatar: '' } ] }
    ],
    alumni: [
      { year: '2018', members: [ { name: 'Musa Sule Argungu', designation: 'Lecturer', organization: 'Kebbi State University, Nigeria', avatar: '' } ] }
    ],
    students: [
      { name: 'John Doe', department: 'MSc Information Technology', email: 'john.doe@student.uum.edu.my', avatar: '' }
    ]
  };

  peopleData: any = { mainTitle: 'The Minds Behind INWLab', subTitle: 'Meet our dedicated team of researchers, faculty, and alumni.' };
  newsData: any = { mainTitle: 'Lab Updates & Bulletins', featureSignal: '🚨 Critical Update', quickUpdatesTitle: 'Quick Updates' };
  conferenceData: any = { mainTitle: 'INWLab Annual Conference 2026', subTitle: 'Shaping the Future of Secure Connectivity', dates: 'Dec 10 - 12, 2026', registerFee: '$299' };
  forumVisitorData: any = { mainTitle: 'INWLab Community Forum', subTitle: 'Join the discussion, share ideas, and solve problems.', newsTitle: 'Forum Guidelines Updated' };
  contactData: any = { mainTitle: 'Get In Touch', email: 'contact@inwlab.edu', phone: '+1 (555) 123-4567', address: 'Engineering Building, Floor 3\nUniversity Campus' };

  bulletins: any[] = []; rooms: any[] = []; topics: any[] = [];

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
      if (legacyProjects && this.resourceData.projects.length === 2) {
        try { const parsedLegacy = JSON.parse(legacyProjects); if (parsedLegacy && parsedLegacy.length > 0) { this.resourceData.projects = parsedLegacy; } } catch(e) {}
      }

      this.aboutData = loadOrInit('inwlab_cms_about', this.aboutData);
      this.teamData = loadOrInit('inwlab_cms_team', this.teamData);
      this.peopleData = loadOrInit('inwlab_cms_people', this.peopleData);
      this.newsData = loadOrInit('inwlab_cms_news', this.newsData);
      this.conferenceData = loadOrInit('inwlab_cms_conference', this.conferenceData);
      this.forumVisitorData = loadOrInit('inwlab_cms_forum_visitor', this.forumVisitorData);
      this.contactData = loadOrInit('inwlab_cms_contact', this.contactData);

      const savedRooms = localStorage.getItem('inwlab_rooms');
      if (savedRooms) { this.rooms = JSON.parse(savedRooms); } else { this.rooms = [ { id: '#101', name: 'Discussion Room A', capacity: 6, status: 'Available' } ]; localStorage.setItem('inwlab_rooms', JSON.stringify(this.rooms)); }
      this.topics = JSON.parse(localStorage.getItem('inwlab_forum_topics') || '[]');
      this.bulletins = JSON.parse(localStorage.getItem('inwlab_bulletins') || '[]');
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

  // Team Mgmt
  addTeamSection() { this.teamData.ourTeam.push({ title: 'New Department', members: [] }); }
  deleteTeamSection(index: number) { if (confirm("Delete this entire department?")) this.teamData.ourTeam.splice(index, 1); }
  addTeamMember(sectionIndex: number) { this.teamData.ourTeam[sectionIndex].members.push({ name: 'New Member', role: 'Role', email: '', socialLink: '', avatar: '' }); }
  deleteTeamMember(sectionIndex: number, memberIndex: number) { if (confirm("Remove this member?")) this.teamData.ourTeam[sectionIndex].members.splice(memberIndex, 1); }

  // Alumni Mgmt
  addAlumniYear() { this.teamData.alumni.unshift({ year: new Date().getFullYear().toString(), members: [] }); }
  deleteAlumniYear(index: number) { if (confirm("Delete this entire class year?")) this.teamData.alumni.splice(index, 1); }
  addAlumniMember(yearIndex: number) { this.teamData.alumni[yearIndex].members.push({ name: 'New Alumni', designation: 'Job Title', organization: 'Company / Uni', avatar: '' }); }
  deleteAlumniMember(yearIndex: number, memberIndex: number) { if (confirm("Remove this alumni?")) this.teamData.alumni[yearIndex].members.splice(memberIndex, 1); }

  // Student Mgmt
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

  // 🌟 核心修复：移除原有的 Getter，改为绝对路径绑定，防止 Strict Mode 报错
  goToLabEditor(labId: string) { this.editingLab = labId; }
  backToResearchMain() { this.editingLab = ''; }
}
