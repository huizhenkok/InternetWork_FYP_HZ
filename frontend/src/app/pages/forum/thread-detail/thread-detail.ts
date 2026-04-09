import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

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
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    // 从网址获取 ID，这里拿到的是一个 String
    this.threadId = this.route.snapshot.paramMap.get('id') || '';

    if (isPlatformBrowser(this.platformId)) {
      const savedTopics = localStorage.getItem('inwlab_forum_topics');
      if (savedTopics) {
        const topics = JSON.parse(savedTopics);

        // 🚨 核心修复：把数据库里的 ID 和网址上的 ID 都套上 String() 强制转换成文字，再做对比！
        this.currentTopic = topics.find((t: any) => String(t.id) === String(this.threadId));
      }
    }

    window.scrollTo(0, 0);
  }
}
