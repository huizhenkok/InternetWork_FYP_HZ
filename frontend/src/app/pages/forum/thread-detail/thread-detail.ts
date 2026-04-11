import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CmsService } from '../../../../services/cms.service'; // 🌟 Added CmsService

@Component({
  selector: 'app-thread-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './thread-detail.html'
})
export class ThreadDetail implements OnInit {
  threadId: string = '';
  currentTopic: any = null;

  constructor(
    private route: ActivatedRoute,
    @Inject(PLATFORM_ID) private platformId: Object,
    private cmsService: CmsService // 🌟 Inject CmsService
  ) {}

  ngOnInit() {
    // Get ID from URL parameters as a String
    this.threadId = this.route.snapshot.paramMap.get('id') || '';

    if (isPlatformBrowser(this.platformId)) {
      // Fetch Forum Topics from MySQL Database
      this.cmsService.getCmsData('inwlab_forum_topics').subscribe({
        next: (res: any) => {
          try {
            const topics = JSON.parse(res.contentJson);
            // Core fix: Cast both database ID and URL ID to String for comparison!
            this.currentTopic = topics.find((t: any) => String(t.id) === String(this.threadId));
          } catch(e) {
            console.error("Error parsing Thread CMS", e);
          }
        },
        error: (err) => console.log("Failed to load thread details", err)
      });
    }

    window.scrollTo(0, 0);
  }
}
