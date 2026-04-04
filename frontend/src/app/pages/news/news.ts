import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';

declare var AOS: any;

@Component({
  selector: 'app-news',
  standalone: true,
  imports: [CommonModule], // 🌟 已经帮你移除了 RouterLink，消除终端的黄色警告
  templateUrl: './news.html'
})
export class News implements OnInit {

  // 当前选中的状态，默认显示 UPCOMING
  activeTab: string = 'UPCOMING';

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        if (typeof AOS !== 'undefined') {
          AOS.init({ duration: 800, once: true, offset: 50 });
          AOS.refreshHard();
          window.scrollTo(0, 0);
        }
      }, 150);
    }
  }

  // 🌟 核心：切换标签页
  setTab(tab: string) {
    this.activeTab = tab;
    // 🌟 修复动画消失的问题：使用 refreshHard() 并增加一点延迟，等 Angular 渲染完新代码再触发动画
    setTimeout(() => {
      if (typeof AOS !== 'undefined') AOS.refreshHard();
    }, 100);
  }

  // 🌟 核心：处理 RSVP 点击
  handleRSVP(eventName: string) {
    alert(`Registration for "${eventName}" will open shortly.\nPlease check back later or contact the lab administration.`);
  }

  // 🌟 核心：原生分享黑科技 (Web Share API)
  async shareEvent(eventName: string) {
    const shareData = {
      title: `INWLab Event: ${eventName}`,
      text: `Check out this upcoming event at INWLab: ${eventName}`,
      url: window.location.href, // 获取当前网页地址
    };

    try {
      if (navigator.share) {
        // 如果浏览器支持原生分享 (手机/部分新版浏览器)
        await navigator.share(shareData);
      } else {
        // 如果不支持，就降级为“复制到剪贴板”
        await navigator.clipboard.writeText(`${shareData.title}\n${shareData.url}`);
        alert('Event link copied to clipboard! You can now paste it anywhere to share.');
      }
    } catch (err) {
      console.log('Error sharing:', err);
    }
  }
}
