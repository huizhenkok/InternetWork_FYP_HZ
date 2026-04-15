import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { RouterModule } from '@angular/router';
import { CmsService } from '../../../services/cms.service';

declare var AOS: any;

@Component({
  selector: 'app-resources',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './resources.html'
})
export class Resources implements OnInit {

  allResources: any[] = [];
  cmsData: any = { mainTitle: 'Public Publications', subTitle: 'Explore research papers...', filterTitle: 'Repository of publications' };

  constructor(@Inject(PLATFORM_ID) private platformId: Object, private cmsService: CmsService) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.cmsService.getCmsData('inwlab_cms_resource').subscribe({
        next: (res: any) => {
          try {
            const p = JSON.parse(res.contentJson);
            this.cmsData.mainTitle = p.mainTitle || this.cmsData.mainTitle;
            this.cmsData.subTitle = p.subTitle || this.cmsData.subTitle;
          } catch(e) {}
        }
      });
      this.loadRealPublications();
    }
  }

  loadRealPublications() {
    this.cmsService.getCmsData('inwlab_publications').subscribe({
      next: (res: any) => {
        try {
          const allImports = JSON.parse(res.contentJson);
          this.allResources = allImports
            .filter((doc: any) => doc.visibility === 'Public')
            .sort((a: any, b: any) => b.timestamp - a.timestamp)
            .map((doc: any) => {
              // 🌟 修复：提取真实的 Journal 和 Year
              return {
                type: 'Publication',
                typeClass: 'bg-primary/10 border-primary/20 text-primary',
                date: doc.publishYear || doc.dateStr.split(' ')[0], // 优先显示年份
                title: doc.fileName, // 这里的 fileName 其实是 Paper Title
                journal: doc.journalName || 'Unknown Journal',
                fileUrl: doc.fileUrl, // 可空
                authors: `${doc.authorName} (${doc.authorRole})`,
                desc: `Published in ${doc.journalName || 'N/A'}. Added to global archive by ${doc.authorName}.`,
                primaryBtnText: doc.fileUrl ? 'Download PDF' : 'No File Available', // 动态按钮文字
                primaryBtnIcon: doc.fileUrl ? 'download' : 'block'
              };
            });
        } catch(e) { this.allResources = []; }
      }
    });
  }

  handleAction(res: any) {
    if (res.fileUrl) {
      window.open(res.fileUrl, '_blank');
    } else {
      alert(`The author only provided metadata for "${res.title}". Full-text PDF is not available.`);
    }
  }

  get titleFirstPart(): string {
    const w = this.cmsData.mainTitle.trim().split(' ');
    return w.length <= 1 ? this.cmsData.mainTitle : w.slice(0, -1).join(' ');
  }
  get titleLastPart(): string {
    const w = this.cmsData.mainTitle.trim().split(' ');
    return w.length <= 1 ? '' : w[w.length - 1];
  }
}
