import { Component, OnInit, HostListener, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterLink } from '@angular/router';

declare var AOS: any;

@Component({
  selector: 'app-publication',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './publication.html'
})
export class Publication implements OnInit {

  isDragging: boolean = false;
  recentImports: any[] = [];
  currentUserEmail: string = '';

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object
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

      const allImports = JSON.parse(localStorage.getItem('inwlab_publications') || '[]');

      let dataChanged = false;
      allImports.forEach((doc: any) => {
        if (!doc.visibility) {
          doc.visibility = 'Private';
          dataChanged = true;
        }
      });
      if (dataChanged) localStorage.setItem('inwlab_publications', JSON.stringify(allImports));

      this.recentImports = allImports
        .filter((doc: any) => doc.userEmail === this.currentUserEmail)
        .sort((a: any, b: any) => b.timestamp - a.timestamp);
    }
  }

  toggleVisibility(record: any) {
    if (isPlatformBrowser(this.platformId)) {
      record.visibility = record.visibility === 'Public' ? 'Private' : 'Public';

      const allImports = JSON.parse(localStorage.getItem('inwlab_publications') || '[]');
      const index = allImports.findIndex((r: any) => r.id === record.id);
      if(index !== -1) {
        allImports[index].visibility = record.visibility;
        localStorage.setItem('inwlab_publications', JSON.stringify(allImports));
      }
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
      const validExtensions = ['pdf', 'bib', 'xml', 'doc', 'docx'];
      const fileExt = file.name.split('.').pop()?.toLowerCase();

      if (!fileExt || !validExtensions.includes(fileExt)) {
        alert(`Invalid format for file: ${file.name}. Only PDF, BIB, or XML allowed.`);
        continue;
      }
      if (file.size > 50 * 1024 * 1024) {
        alert(`File ${file.name} is too large. Max size is 50MB.`);
        continue;
      }
      this.saveFileRecord(file.name);
    }
  }

  saveFileRecord(fileName: string) {
    if (isPlatformBrowser(this.platformId)) {
      const activeUser = JSON.parse(localStorage.getItem('active_user') || '{}');
      const allImports = JSON.parse(localStorage.getItem('inwlab_publications') || '[]');

      const newRecord = {
        id: Date.now() + Math.random(),
        fileName: fileName,
        userEmail: this.currentUserEmail,
        authorName: activeUser.fullName || 'Unknown Scholar',
        authorRole: activeUser.role || 'Member',
        timestamp: Date.now(),
        dateStr: new Date().toLocaleDateString() + ' ' + new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
        status: 'Completed',
        visibility: 'Private'
      };

      allImports.push(newRecord);
      localStorage.setItem('inwlab_publications', JSON.stringify(allImports));

      this.loadImports();
      alert(`${fileName} uploaded successfully!\nBy default, this file is PRIVATE. You can make it PUBLIC in the list below.`);
    }
  }
}
