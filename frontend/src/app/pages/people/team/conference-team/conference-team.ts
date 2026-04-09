import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface CommitteeMember { name: string; org: string; role?: string; }
interface Committee { title: string; members: CommitteeMember[]; }

declare var AOS: any;

@Component({
  selector: 'app-conference-team',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './conference-team.html'
})
export class ConferenceTeam implements OnInit, OnChanges {
  // 🌟 接收外部传入的当前年份团队数据
  @Input() committeeData: Committee[] = [];
  @Input() searchTerm: string = '';

  filteredCommittees: Committee[] = [];

  ngOnInit() {
    this.filterCommittee();
  }

  ngOnChanges() {
    this.filterCommittee();
  }

  filterCommittee() {
    if (!this.committeeData || this.committeeData.length === 0) {
      this.filteredCommittees = [];
      return;
    }

    if (!this.searchTerm || this.searchTerm.trim() === '') {
      this.filteredCommittees = JSON.parse(JSON.stringify(this.committeeData));
      return;
    }

    const term = this.searchTerm.toLowerCase();
    this.filteredCommittees = this.committeeData.map(committee => {
      return {
        title: committee.title,
        members: committee.members.filter(m =>
          m.name.toLowerCase().includes(term) ||
          m.org.toLowerCase().includes(term) ||
          (m.role && m.role.toLowerCase().includes(term))
        )
      };
    }).filter(committee => committee.members.length > 0);

    setTimeout(() => {
      if (typeof AOS !== 'undefined') AOS.refresh();
    }, 50);
  }
}
