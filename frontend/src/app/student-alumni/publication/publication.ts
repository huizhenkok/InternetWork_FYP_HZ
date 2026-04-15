import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms'; // 🌟 引入 FormsModule 用于表单
import { CmsService } from '../../../services/cms.service';
import { UploadService } from '../../../services/upload.service';

declare var AOS: any;

@Component({
  selector: 'app-publication',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './publication.html'
})
export class Publication implements OnInit {

  isUploading: boolean = false;
  recentImports: any[] = [];
  currentUserEmail: string = '';

  // 🌟 表单数据
  pubForm = {
    paperTitle: '',
    journalName: '',
    publishYear: ''
  };
  selectedFile: File | null = null;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private cmsService: CmsService,
    private uploadService: UploadService
  ) {}

  ngOnInit() {
    this.loadImports();
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        if (typeof AOS !== 'undefined') { AOS.init({ duration: 800, once: true, offset: 50 }); AOS.refreshHard(); }
      }, 100);
    }
  }

  loadImports() {
    if (isPlatformBrowser(this.platformId)) {
      const activeUser = JSON.parse(localStorage.getItem('active_user') || '{}');
      this.currentUserEmail = activeUser.email;

      this.cmsService.getCmsData('inwlab_publications').subscribe({
        next: (res: any) => {
          try {
            const allImports = JSON.parse(res.contentJson);
            this.recentImports = allImports
              .filter((doc: any) => doc.userEmail === this.currentUserEmail)
              .sort((a: any, b: any) => b.timestamp - a.timestamp);
          } catch(e) { this.recentImports = []; }
        },
        error: () => this.recentImports = []
      });
    }
  }

  toggleVisibility(record: any) {
    if (isPlatformBrowser(this.platformId)) {
      record.visibility = record.visibility === 'Public' ? 'Private' : 'Public';
      this.cmsService.getCmsData('inwlab_publications').subscribe({
        next: (res: any) => {
          const allImports = JSON.parse(res.contentJson);
          const index = allImports.findIndex((r: any) => r.id === record.id);
          if(index !== -1) {
            allImports[index].visibility = record.visibility;
            this.cmsService.saveCmsData('inwlab_publications', JSON.stringify(allImports)).subscribe();
          }
        }
      });
    }
  }

  deleteRecord(id: any) {
    if (confirm('Are you sure you want to delete this record? This action cannot be undone.')) {
      this.cmsService.getCmsData('inwlab_publications').subscribe({
        next: (res: any) => {
          let allImports = JSON.parse(res.contentJson);
          allImports = allImports.filter((r: any) => r.id !== id);
          this.cmsService.saveCmsData('inwlab_publications', JSON.stringify(allImports)).subscribe({
            next: () => { this.loadImports(); alert('Record deleted successfully!'); }
          });
        }
      });
    }
  }

  onFileSelect(event: any) {
    if (event.target.files.length > 0) {
      this.selectedFile = event.target.files[0];
    }
  }

  // 🌟 核心：提交表单（文件变为可选）
  submitPublication() {
    if (!this.pubForm.paperTitle.trim() || !this.pubForm.journalName.trim() || !this.pubForm.publishYear.trim()) {
      alert("Please fill in the Paper Title, Journal Name, and Year.");
      return;
    }

    this.isUploading = true;

    // 如果有附件，先上传附件；如果没有，直接保存元数据
    if (this.selectedFile) {
      this.uploadService.uploadFile(this.selectedFile).subscribe({
        next: (res: any) => {
          this.saveFileRecord(res.url); // 有文件，存真实 URL
        },
        error: () => {
          this.isUploading = false;
          alert(`Failed to upload ${this.selectedFile!.name}.`);
        }
      });
    } else {
      this.saveFileRecord(''); // 没文件，存空字符串
    }
  }

  saveFileRecord(fileUrl: string) {
    if (isPlatformBrowser(this.platformId)) {
      const activeUser = JSON.parse(localStorage.getItem('active_user') || '{}');
      this.cmsService.getCmsData('inwlab_publications').subscribe({
        next: (res: any) => {
          const allImports = JSON.parse(res.contentJson);
          this.appendAndSaveRecord(allImports, fileUrl, activeUser);
        },
        error: () => this.appendAndSaveRecord([], fileUrl, activeUser)
      });
    }
  }

  appendAndSaveRecord(allImports: any[], fileUrl: string, activeUser: any) {
    const newRecord = {
      id: Date.now() + Math.random(),
      fileName: this.pubForm.paperTitle, // 将 Paper Title 作为列表主标题
      journalName: this.pubForm.journalName,
      publishYear: this.pubForm.publishYear,
      fileUrl: fileUrl, // 可空
      userEmail: this.currentUserEmail,
      authorName: activeUser.fullName || 'Unknown Scholar',
      authorRole: activeUser.role || 'Member',
      timestamp: Date.now(),
      dateStr: new Date().toLocaleDateString(),
      status: fileUrl ? 'With File' : 'Metadata', // 区分状态
      visibility: 'Private'
    };

    allImports.push(newRecord);
    this.cmsService.saveCmsData('inwlab_publications', JSON.stringify(allImports)).subscribe({
      next: () => {
        this.isUploading = false;
        this.pubForm = { paperTitle: '', journalName: '', publishYear: '' }; // 清空表单
        this.selectedFile = null; // 清空文件
        this.loadImports();
        alert(`Publication successfully added!\nBy default, it is PRIVATE. Make it PUBLIC below.`);
      }
    });
  }
}
