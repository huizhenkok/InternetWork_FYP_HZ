import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';

declare var AOS: any;

@Component({
  selector: 'app-student-alumni',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './student-alumni.html'
})
export class StudentAlumni implements OnInit {

  userRole: string = 'Researcher';
  userName: string = 'User'; // 如果系统真的发生错误，保底显示 User

  constructor(
    private route: ActivatedRoute,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    this.route.data.subscribe(data => {
      if (data['role']) {
        this.userRole = data['role'];
      }
    });

    if (isPlatformBrowser(this.platformId)) {
      setTimeout(() => {
        if (typeof AOS !== 'undefined') {
          AOS.init({ duration: 800, once: true, offset: 50 });
          AOS.refreshHard();
          window.scrollTo(0, 0);
        }
      }, 150);

      // 调用精准抓取名字的函数
      this.loadUserData();
    }
  }

  // 🌟 读取名字的核心逻辑
  loadUserData() {
    try {
      // 获取当前正在登录的用户通行证
      const activeUserStr = localStorage.getItem('active_user');

      if (activeUserStr) {
        const activeUser = JSON.parse(activeUserStr);

        // 确保名字存在
        if (activeUser && activeUser.fullName) {
          // 为了亲切感，如果有空格（如 "John Doe"），我们只取第一个词 "John"
          this.userName = activeUser.fullName.split(' ')[0];

          if (activeUser.role) {
            this.userRole = activeUser.role;
          }
        }
      }
    } catch (e) {
      console.error("Error loading user session data", e);
    }
  }
}
