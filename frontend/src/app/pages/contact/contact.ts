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

      setTimeout(() => {
        if (typeof AOS !== 'undefined') {
          AOS.init({ duration: 800, once: true, offset: 50 });
          AOS.refreshHard();
          window.scrollTo(0, 0);
        }
      }, 150);
    }
  }

  // 模拟发送表单的过程
  sendMessage() {
    if (!this.formData.name || !this.formData.email || !this.formData.message) {
      alert("Please fill in all required fields before sending.");
      return;
    }

    this.isSending = true;

    setTimeout(() => {
      this.isSending = false;
      this.isSent = true;

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
