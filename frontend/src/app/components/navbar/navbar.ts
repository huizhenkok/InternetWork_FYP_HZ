import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import {RouterLink, RouterLinkActive} from '@angular/router'; // 🌟 换回最稳妥的 RouterModule

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive], // 🌟 这里也改回来
  templateUrl: './navbar.html'
})
export class Navbar {
  @Input() isDarkMode = false;
  @Output() toggleThemeEvent = new EventEmitter<void>();

  isNetappsMenuOpen = false;
  isMobileMenuOpen = false;

  onToggleTheme() {
    this.toggleThemeEvent.emit();
  }

  toggleNetappsMenu() {
    this.isNetappsMenuOpen = !this.isNetappsMenuOpen;
  }
}
