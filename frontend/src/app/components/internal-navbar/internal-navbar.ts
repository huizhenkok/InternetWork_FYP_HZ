import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';

@Component({
  selector: 'app-internal-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './internal-navbar.html'
})
export class InternalNavbar implements OnInit {
  @Input() isDarkMode = false;
  @Output() toggleThemeEvent = new EventEmitter<void>();

  // 🌟 动态 Home 链接：默认去 student
  homeLink: string = '/student';

  constructor(private router: Router) {}

  ngOnInit() {
    // 🌟 如果当前网址包含 alumni，就把 Home 按钮指向 alumni
    if (this.router.url.includes('/alumni')) {
      this.homeLink = '/alumni';
    }
  }

  toggleTheme() {
    this.toggleThemeEvent.emit();
  }
}
