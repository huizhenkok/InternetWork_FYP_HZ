import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ContactService } from '../../../services/contact.service';
import { CmsService } from '../../../services/cms.service'; // 🌟 Added CmsService

declare var AOS: any;

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './contact.html'
})
export class Contact implements OnInit {

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

  formData = {
    name: '',
    email: '',
    department: 'Project Inquiry',
    message: ''
  };

  isSending: boolean = false;
  isSent: boolean = false;

  constructor(
    private contactService: ContactService,
    private cmsService: CmsService, // 🌟 Inject CmsService
    @Inject(PLATFORM_ID) private platformId: Object
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {

      // 🌟 Core modification: Fetch Contact CMS data from MySQL
      this.cmsService.getCmsData('inwlab_cms_contact').subscribe({
        next: (res: any) => {
          try {
            const parsed = JSON.parse(res.contentJson);
            this.cmsData = { ...this.cmsData, ...parsed };
          } catch(e) { console.error("Error parsing Contact CMS", e); }
        },
        error: () => console.log('Using default Contact data')
      });

      // Auto-fill active user data
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

  sendMessage() {
    if (!this.formData.name || !this.formData.email || !this.formData.message) {
      alert("Please fill in all required fields before sending.");
      return;
    }

    this.isSending = true;

    this.contactService.submitMessage(this.formData).subscribe({
      next: (response: any) => {
        this.isSending = false;
        this.isSent = true;
        this.formData = { name: '', email: '', department: 'Project Inquiry', message: '' };

        setTimeout(() => { this.isSent = false; }, 3000);
      },
      error: (err: any) => {
        this.isSending = false;
        console.error("Message Error:", err);
        alert("Failed to send message to the server. Please try again.");
      }
    });
  }
}
