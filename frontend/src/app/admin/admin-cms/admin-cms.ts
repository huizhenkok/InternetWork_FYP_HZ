import { Component, OnInit, Inject, PLATFORM_ID, NgZone } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CmsService } from '../../../services/cms.service';
import { UploadService } from '../../../services/upload.service'; // 🌟 Import the new UploadService

declare var AOS: any;

@Component({
  selector: 'app-admin-cms',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './admin-cms.html'
})
export class AdminCms implements OnInit {

  adminName: string = 'System Admin';
  activeTab: string = 'contact';
  editingLab: string = '';
  activeAboutTab: string = 'vision';
  activeTeamTab: string = 'team';

  editingConfIndex: number | null = null;
  activeConfTab: string = 'home';

  isUploading: boolean = false; // 🌟 Added: To handle UI loading state during file upload

  // ==============================
  // 🗄️ Global Database Mapping
  // ==============================
  homeData: any = { heading: 'Innovating the Future...', subheading: '...', announcement: '...', upcomingEvent: '...', upcomingEventDesc: '...', conferenceDate: '...', stats: {} };
  researchData: any = { mainTitle: 'Research Areas', subTitle: '...', domains: { cyber: {}, forensics: {}, iot: {}, ai: {}, cloud: {}, network: {} } };
  resourceData: any = { mainTitle: 'Public Publications', subTitle: '...', filterTitle: '...', projects: [] };
  aboutData: any = { visionMission: {}, objective: {}, philosophy: {} };
  teamData: any = { mainTitle: 'Leadership & Team', subTitle: '...', ourTeam: [], alumni: [], students: [] };
  newsAndEventsData: any = { mainTitle: 'NEWS', mainTitleHighlight: '& EVENTS', subTitle: '...', flagship: {}, gatheringsTitle: '...', gatherings: [], quickUpdatesTitle: '...', quickUpdates: [], quoteText: '...', quoteAuthor: '...' };

  conferences: any[] = [
    {
      year: '2026',
      title: 'The International Conference on Internet Applications, Protocols and Services',
      shortName: 'NETAPPS',
      home: {
        paragraph1: 'The International Conference on Internet Applications, Protocols and Services (NETAPPS 2026) is a no-frills conference in the area of Internet communications and networking.',
        paragraph2: 'The main goal of this conference is to serve as an affordable platform to promote greater engagement of network researchers from around the globe...',
        confDate: '6 & 7 November 2026',
        targetDate: '2026-11-06T00:00:00',
        date1: 'August 15, 2026',
        date2: 'Sept 30, 2026',
        fee1: 'RM 1,000',
        fee2: 'RM 800'
      },
      cfp: 'All papers must be original and not simultaneously submitted to another journal or conference.\n\nPaper format guidelines...',
      reg: 'Registration & Final Submission details to be announced.',
      imageUrl: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=2070&auto=format&fit=crop',
      pdfUrl: '',
      team: []
    }
  ];

  contactData: any = {
    mainTitle: 'Get in Touch.',
    subTitle: 'Initiate a secure inquiry. Our team is ready to discuss research collaborations, industry partnerships, and academic opportunities.',
    emailLabel: 'General Inquiries',
    email: 'netapps@internetworks.my',
    addressLabel: 'Base of Operations',
    address: 'School of Computing,\nUniversiti Utara Malaysia,\n06010 Sintok, Kedah.',
    social1: '#',
    social2: '#'
  };

  rooms: any[] = [];
  bulletins: any[] = [];

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private ngZone: NgZone,
    private router: Router,
    private cmsService: CmsService,
    private uploadService: UploadService // 🌟 Inject UploadService
  ) {}

  ngOnInit() {
    this.loadAllData();
    if (isPlatformBrowser(this.platformId)) { setTimeout(() => { if (typeof AOS !== 'undefined') { AOS.init({ duration: 800, once: true, offset: 50 }); AOS.refreshHard(); } }, 100); }
  }

  loadAllData() {
    if (isPlatformBrowser(this.platformId)) {
      const activeUser = JSON.parse(localStorage.getItem('active_user') || '{}');
      if (activeUser.fullName) this.adminName = activeUser.fullName;

      this.loadFromDB('inwlab_cms_home', 'homeData', this.homeData);
      this.loadFromDB('inwlab_cms_research', 'researchData', this.researchData);
      this.loadFromDB('inwlab_cms_resource', 'resourceData', this.resourceData);
      this.loadFromDB('inwlab_cms_about', 'aboutData', this.aboutData);
      this.loadFromDB('inwlab_cms_team', 'teamData', this.teamData);
      this.loadFromDB('inwlab_cms_news_events', 'newsAndEventsData', this.newsAndEventsData);
      this.loadFromDB('inwlab_cms_conferences', 'conferences', this.conferences);
      this.loadFromDB('inwlab_cms_contact', 'contactData', this.contactData);
      this.loadFromDB('inwlab_rooms', 'rooms', [{ id: '#101', name: 'Discussion Room A', capacity: 6, status: 'Available', icon: 'meeting_room', color: 'teal' }]);
      this.loadFromDB('inwlab_bulletins', 'bulletins', []);
    }
  }

  loadFromDB(key: string, property: string, defaultData: any) {
    this.cmsService.getCmsData(key).subscribe({
      next: (res: any) => {
        try {
          const parsed = JSON.parse(res.contentJson);
          if (Array.isArray(defaultData)) {
            (this as any)[property] = parsed;
          } else {
            (this as any)[property] = { ...defaultData, ...parsed };
          }
        } catch(e) {
          (this as any)[property] = defaultData;
        }
      },
      error: () => {
        const oldLocalData = localStorage.getItem(key);
        let dataToUse = defaultData;

        if (oldLocalData) {
          try {
            const parsedOld = JSON.parse(oldLocalData);
            dataToUse = Array.isArray(defaultData) ? parsedOld : { ...defaultData, ...parsedOld };
          } catch(e) {}
        }

        (this as any)[property] = dataToUse;
        this.saveModule(key, dataToUse, 'Data Migration', true);
      }
    });
  }

  saveModule(key: string, data: any, moduleName: string, silent: boolean = false) {
    if (isPlatformBrowser(this.platformId)) {
      this.cmsService.saveCmsData(key, JSON.stringify(data)).subscribe({
        next: () => {
          if (!silent) alert(`✅ ${moduleName} updated successfully! Visitors will see this instantly from the Database.`);
        },
        error: (err: any) => {
          if (!silent) alert(`❌ Failed to update ${moduleName}. Check server connection.`);
          console.error(err);
        }
      });
    }
  }

  // Action Triggers for saving specific modules
  saveHome() { this.saveModule('inwlab_cms_home', this.homeData, 'Home Page'); }
  saveResearch() { this.saveModule('inwlab_cms_research', this.researchData, 'Research Area'); }
  saveResource() { this.saveModule('inwlab_cms_resource', this.resourceData, 'Publication & Projects'); }
  saveAbout() { this.saveModule('inwlab_cms_about', this.aboutData, 'About Us Information'); }
  saveTeam() { this.saveModule('inwlab_cms_team', this.teamData, 'Team & Leadership Directory'); }
  saveNews() { this.saveModule('inwlab_cms_news_events', this.newsAndEventsData, 'News & Events'); }
  saveContact() { this.saveModule('inwlab_cms_contact', this.contactData, 'Contact Info'); }
  saveRooms() { this.saveModule('inwlab_rooms', this.rooms, 'Lab Facilities'); }
  saveBulletins() { this.saveModule('inwlab_bulletins', this.bulletins, 'System Bulletins'); }

  // ==========================================
  // 🌟 Universal File Upload Logic
  // ==========================================
  onFileUpload(event: any, targetObject: any, targetProperty: string) {
    const file = event.target.files[0];
    if (!file) return;

    this.isUploading = true;

    this.uploadService.uploadFile(file).subscribe({
      next: (res: any) => {
        // Assign the returned URL directly to the target object's property
        targetObject[targetProperty] = res.url;
        this.isUploading = false;
        alert('✅ Image uploaded successfully!');
      },
      error: (err: any) => {
        console.error("Upload Error:", err);
        this.isUploading = false;
        alert('❌ Failed to upload image. Please check server connection.');
      }
    });
  }

  // ==========================================
  // 🌟 Array Management Logic
  // ==========================================

  saveConferences() {
    this.conferences.sort((a: any, b: any) => parseInt(b.year) - parseInt(a.year));
    this.saveModule('inwlab_cms_conferences', this.conferences, 'Conference Databases');
  }

  addNewConference() {
    const nextYear = (new Date().getFullYear() + 1).toString();
    this.conferences.unshift({
      year: nextYear,
      title: 'The International Conference on Internet Applications, Protocols and Services',
      shortName: 'NETAPPS',
      home: { paragraph1: 'Conference description here...', paragraph2: 'Goals and objectives...', confDate: `November ${nextYear}`, targetDate: `${nextYear}-11-06T00:00:00`, date1: `August 15, ${nextYear}`, date2: `Sept 30, ${nextYear}`, fee1: 'RM 1,000', fee2: 'RM 800' },
      cfp: 'Call for paper guidelines...',
      reg: 'Registration details...',
      imageUrl: '',
      pdfUrl: '',
      team: []
    });
    this.saveConferences();
  }

  deleteConference(index: number) {
    if (confirm(`Are you sure you want to completely delete the conference for year ${this.conferences[index].year}?`)) {
      this.conferences.splice(index, 1);
      this.saveConferences();
    }
  }

  openConferenceEditor(index: number) { this.editingConfIndex = index; this.activeConfTab = 'home'; }
  closeConferenceEditor() { this.editingConfIndex = null; this.saveConferences(); }

  addConfCommittee() { if (this.editingConfIndex !== null) this.conferences[this.editingConfIndex].team.push({ title: 'New Committee', members: [] }); }
  deleteConfCommittee(cIndex: number) { if (this.editingConfIndex !== null && confirm("Delete this entire committee?")) this.conferences[this.editingConfIndex].team.splice(cIndex, 1); }
  addConfMember(cIndex: number) { if (this.editingConfIndex !== null) this.conferences[this.editingConfIndex].team[cIndex].members.push({ name: 'Member Name', org: 'University / Org', role: '' }); }
  deleteConfMember(cIndex: number, mIndex: number) { if (this.editingConfIndex !== null && confirm("Remove this member?")) this.conferences[this.editingConfIndex].team[cIndex].members.splice(mIndex, 1); }

  addGathering() { this.newsAndEventsData.gatherings.push({ date: 'DATE', location: 'LOCATION', title: 'New Event Title', desc: 'Event description.', icon: 'event' }); }
  deleteGathering(index: number) { if (confirm("Remove this gathering?")) this.newsAndEventsData.gatherings.splice(index, 1); }
  addQuickUpdate() { this.newsAndEventsData.quickUpdates.push({ tag: 'NEW TAG', text: 'New update text here.' }); }
  deleteQuickUpdate(index: number) { if (confirm("Remove this update?")) this.newsAndEventsData.quickUpdates.splice(index, 1); }
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
  deleteProject(index: number) { if (confirm("Delete this project permanently?")) this.resourceData.projects.splice(index, 1); }

  addNewRoom() {
    const colors = ['teal', 'slate', 'cyan', 'orange'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    this.rooms.push({ id: '#'+Math.floor(Math.random()*900+100), name: 'New Room', capacity: 10, status: 'Available', icon: 'meeting_room', color: randomColor });
  }
  deleteRoom(index: number) { if (confirm("Delete this facility?")) this.rooms.splice(index, 1); }

  addNewBulletin() {
    this.bulletins.unshift({ title: 'New Important Notice', dateLabel: 'Just Now', content: 'Enter the details of the announcement here...', icon: 'campaign', color: 'primary' });
    this.saveBulletins();
  }
  deleteBulletin(index: number) { if (confirm("Are you sure you want to delete this bulletin?")) { this.bulletins.splice(index, 1); this.saveBulletins(); } }

  logout() { if (confirm("Are you sure you want to logout?")) { localStorage.removeItem('active_user'); this.router.navigate(['/login']); } }
  goToLabEditor(labId: string) { this.editingLab = labId; }
  backToResearchMain() { this.editingLab = ''; }
}
