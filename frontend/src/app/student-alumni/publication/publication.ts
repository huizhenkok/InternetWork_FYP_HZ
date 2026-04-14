import { Component, OnInit, HostListener, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CmsService } from '../../../services/cms.service';
import { UploadService } from '../../../services/upload.service';

declare var AOS: any;

@Component({
  selector: 'app-publication',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './publication.html'
})
export class Publication implements OnInit {

  isDragging: boolean = false;
  isUploading: boolean = false;
  recentImports: any[] = [];
  currentUserEmail: string = '';

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private cmsService: CmsService,
    private uploadService: UploadService
  ) {}

  ngOnInit() {
    this.loadImports();
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        if (typeof AOS !== 'undefined') {
          AOS.init({ duration: 800, once: true, offset: 50 });
          AOS.refreshHard();
        }
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
          } catch(e) {
            console.error("Error parsing Publications", e);
            this.recentImports = [];
          }
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

  // 🌟 FIX: Added the logic to completely delete the record from database
  deleteRecord(id: any) {
    if (confirm('Are you sure you want to delete this publication? This action cannot be undone.')) {
      this.cmsService.getCmsData('inwlab_publications').subscribe({
        next: (res: any) => {
          let allImports = JSON.parse(res.contentJson);
          // Filter out the record that needs to be deleted
          allImports = allImports.filter((r: any) => r.id !== id);

          // Save the new cleaned array back to the database
          this.cmsService.saveCmsData('inwlab_publications', JSON.stringify(allImports)).subscribe({
            next: () => {
              this.loadImports(); // Refresh the UI
              alert('Publication deleted successfully!');
            }
          });
        }
      });
    }
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;
  }

  onDrop(event: DragEvent) {
    event.preventDefault();
    event.stopPropagation();
    this.isDragging = false;

    if (event.dataTransfer && event.dataTransfer.files.length > 0) {
      this.handleFiles(event.dataTransfer.files);
    }
  }

  onFileSelect(event: any) {
    if (event.target.files.length > 0) {
      this.handleFiles(event.target.files);
    }
  }

  handleFiles(files: FileList) {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const validExtensions = ['pdf', 'bib', 'xml', 'doc', 'docx', 'jpg', 'png'];
      const fileExt = file.name.split('.').pop()?.toLowerCase();

      if (!fileExt || !validExtensions.includes(fileExt)) {
        alert(`Invalid format for file: ${file.name}.`);
        continue;
      }

      this.isUploading = true;

      this.uploadService.uploadFile(file).subscribe({
        next: (res: any) => {
          this.isUploading = false;
          this.saveFileRecord(file.name, res.url);
        },
        error: (err: any) => {
          this.isUploading = false;
          alert(`Failed to upload ${file.name} to server.`);
        }
      });
    }
  }

  saveFileRecord(fileName: string, fileUrl: string) {
    if (isPlatformBrowser(this.platformId)) {
      const activeUser = JSON.parse(localStorage.getItem('active_user') || '{}');

      this.cmsService.getCmsData('inwlab_publications').subscribe({
        next: (res: any) => {
          const allImports = JSON.parse(res.contentJson);
          this.appendAndSaveRecord(allImports, fileName, fileUrl, activeUser);
        },
        error: () => {
          this.appendAndSaveRecord([], fileName, fileUrl, activeUser);
        }
      });
    }
  }

  appendAndSaveRecord(allImports: any[], fileName: string, fileUrl: string, activeUser: any) {
    const newRecord = {
      id: Date.now() + Math.random(),
      fileName: fileName,
      fileUrl: fileUrl,
      userEmail: this.currentUserEmail,
      authorName: activeUser.fullName || 'Unknown Scholar',
      authorRole: activeUser.role || 'Member',
      timestamp: Date.now(),
      dateStr: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
      status: 'Completed',
      visibility: 'Private'
    };

    allImports.push(newRecord);
    this.cmsService.saveCmsData('inwlab_publications', JSON.stringify(allImports)).subscribe({
      next: () => {
        this.loadImports();
        alert(`${fileName} uploaded successfully to Server!\nBy default, this file is PRIVATE. You can make it PUBLIC in the list below.`);
      }
    });
  }
}
