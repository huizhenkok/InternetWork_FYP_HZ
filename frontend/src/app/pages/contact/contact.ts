import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';

declare var AOS: any;

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact.html'
})
export class Contact implements OnInit {

  // 🌟 核心：默认展示数据，如果数据库是空的就显示这些保底数据
  cmsData: any = {
    mainTitle: 'Get in Touch.',
    subTitle: 'Initiate a secure inquiry. Our team is ready to discuss research collaborations, industry partnerships, and academic opportunities.',
    emailLabel: 'General Inquiries',
    email: 'netapps@internetworks.my',
    addressLabel: 'Base of Operations',
    address: 'School of Computing,\nUniversiti Utara Malaysia,\n06010 Sintok, Kedah.',
    social1: '#',
    social2: '#'
  };

  // 表单数据模型
  formData = {
    name: '',
    email: '',
    department: 'Project Inquiry',
    message: ''
  };

  // 发送状态控制
  isSending: boolean = false;
  isSent: boolean = false;

  constructor(@Inject(PLATFORM_ID) private platformId: Object) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {

      // 🌟 加载 Admin 在后台填写的联系方式数据
      const savedCms = localStorage.getItem('inwlab_cms_contact');
      if (savedCms) {
        try {
          const parsed = JSON.parse(savedCms);
          this.cmsData = { ...this.cmsData, ...parsed };
        } catch(e) {}
      }

      // 🌟 体验优化：如果用户已经登录，自动填充他们的名字和邮箱
      try {
        const activeUserStr = localStorage.getItem('active_user');
        if (activeUserStr) {
          const activeUser = JSON.parse(activeUserStr);
          if (activeUser && activeUser.email) {
            this.formData.name = activeUser.fullName || '';
            this.formData.email = activeUser.email;
          }
        }
      } catch(e) {}

      setTimeout(() => {
        if (typeof AOS !== 'undefined') {
          AOS.init({ duration: 800, once: true, offset: 50 });
          AOS.refreshHard();
          window.scrollTo(0, 0);
        }
      }, 150);
    }
  }

  // 🌟 真实发送表单的过程：将数据存入本地数据库，供 Admin 查看
  sendMessage() {
    if (!this.formData.name || !this.formData.email || !this.formData.message) {
      alert("Please fill in all required fields before sending.");
      return;
    }

    this.isSending = true;

    setTimeout(() => {

      if (isPlatformBrowser(this.platformId)) {
        // 取出旧的留言记录
        const existingMessages = JSON.parse(localStorage.getItem('inwlab_contact_messages') || '[]');

        // 把新的留言插到最前面
        existingMessages.unshift({
          id: 'MSG-' + Math.floor(Math.random() * 90000 + 10000), // 生成随机编号
          name: this.formData.name,
          email: this.formData.email,
          department: this.formData.department,
          message: this.formData.message,
          date: new Date().toLocaleString(),
          status: 'Unread' // 默认状态为未读
        });

        // 存回数据库
        localStorage.setItem('inwlab_contact_messages', JSON.stringify(existingMessages));
      }

      this.isSending = false;
      this.isSent = true;

      // 清空输入框
      this.formData = {
        name: '',
        email: '',
        department: 'Project Inquiry',
        message: ''
      };

      setTimeout(() => {
        this.isSent = false;
      }, 3000);

    }, 1500);
  }
}
