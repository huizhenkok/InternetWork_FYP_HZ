import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-active-student',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './active-student.html'
})
export class ActiveStudent {
  @Input() searchTerm: string = '';
  // 目前不需要任何逻辑，保持空状态即可
}
