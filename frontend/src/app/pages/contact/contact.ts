import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms'; // 🌟 引入表单模块以抓取数据

declare var AOS: any;

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact.html'
})
export class Contact implements OnInit {

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
      setTimeout(() => {
        if (typeof AOS !== 'undefined') {
          AOS.init({ duration: 800, once: true, offset: 50 });
          AOS.refreshHard();
          window.scrollTo(0, 0);
        }
      }, 150);
    }
  }

  // 🌟 模拟发送表单的过程
  sendMessage() {
    // 简单验证：确保必填项不为空
    if (!this.formData.name || !this.formData.email || !this.formData.message) {
      alert("Please fill in all required fields before sending.");
      return;
    }

    // 触发发送中状态
    this.isSending = true;

    // 模拟网络延迟 (1.5秒后显示成功)
    setTimeout(() => {
      this.isSending = false;
      this.isSent = true;

      // 成功后，清空表单
      this.formData = {
        name: '',
        email: '',
        department: 'Project Inquiry',
        message: ''
      };

      // 3秒后恢复按钮的原始状态
      setTimeout(() => {
        this.isSent = false;
      }, 3000);

    }, 1500);
  }
}
