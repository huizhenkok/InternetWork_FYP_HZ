import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

interface CommitteeMember {
  name: string;
  org: string;
  role?: string;
}

interface Committee {
  title: string;
  members: CommitteeMember[];
}

declare var AOS: any;

@Component({
  selector: 'app-conference-team',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './conference-team.html'
})
export class ConferenceTeam implements OnChanges {
  @Input() searchTerm: string = '';

  allCommittees: Committee[] = [
    {
      title: 'Executive Chairs',
      members: [
        { name: 'Prof. Dr. Suhaidi Hassan', org: 'Universiti Utara Malaysia', role: 'Advisor' },
        { name: 'Prof. Dr. Osman Ghazali', org: 'Universiti Utara Malaysia', role: 'General Chair' },
        { name: 'Dr. Mohammed Alsamman', org: 'Universiti Utara Malaysia', role: 'First Deputy General Chair' },
        { name: 'Dr. Hapini Awang', org: 'Universiti Utara Malaysia', role: 'Second Deputy General Chair' }
      ]
    },
    {
      title: 'Secretariat',
      members: [
        { name: 'Dr. Nur Suhaili Mansor', org: 'Universiti Utara Malaysia' },
        { name: 'Suwannit Chareen Chitre', org: 'Universiti Utara Malaysia' }
      ]
    },
    {
      title: 'Finance & Registration Committee',
      members: [
        { name: 'Dr. Baharudin Osman', org: 'Universiti Utara Malaysia' },
        { name: 'Ali Yusni', org: 'Universiti Utara Malaysia' }
      ]
    },
    {
      title: 'Sponsorship Committee',
      members: [
        { name: 'Prof. Madya. Dr. Mohd Fadli Zolkipli', org: 'Universiti Utara Malaysia' },
        { name: 'Dr. Khuzairi Mohd. Zaini', org: 'Universiti Utara Malaysia' }
      ]
    },
    {
      title: 'Publicity & Public Relations Committee',
      members: [
        { name: 'Prof. Madya. Dr. Mohd. Hasbullah Omar', org: 'Universiti Utara Malaysia' },
        { name: 'Dr. Amran Ahmad', org: 'Universiti Utara Malaysia' }
      ]
    },
    {
      title: 'Technical Program Committee',
      members: [
        { name: 'Mohammed Gamal Alsamman', org: 'Universiti Utara Malaysia' },
        { name: 'Abdulwadood Alawdhi', org: 'Universiti Utara Malaysia' },
        { name: 'Ahmad Suki Che Mohamed Arif', org: 'Universiti Utara Malaysia' },
        { name: 'Wan Aida Nadia Wan Abdullah', org: 'Universiti Utara Malaysia' },
        { name: 'Mohd Fais Bin Mansor', org: 'ComSoc/VTS' },
        { name: 'Massudi Mahmuddin', org: 'Universiti Utara Malaysia' },
        { name: 'Nur Haryani Zakaria', org: 'Universiti Utara Malaysia' },
        { name: 'Feras Zen Alden', org: 'Universiti Teknologi MARA' },
        { name: 'Dr. Ikram Ud Din', org: 'University of Haripur' },
        { name: 'Dr. Kawakib Khadyair Ahmed', org: 'Iraq' },
        { name: 'Dr. Walid Elbreiki', org: 'College of Computer Technology' },
        { name: 'Shivaleela Arlimatti', org: 'Dr. D.Y.Patil Pratishthan’s College of Engineering' },
        { name: 'Swetha Indudhar Goudar', org: 'KLS Gogte Institute of Technology' },
        { name: 'Omar Dakkak', org: 'Karabük University' },
        { name: 'Yousef Fazea', org: 'Marshall University' },
        { name: 'Ibrahim Abdullahi', org: 'Ibrahim Badamasi Babangida University Lapai' },
        { name: 'Muktar Hussaini', org: 'Hussaini Adamu Federal Polytechnic Kazaure' },
        { name: 'Mowafaq Salem Alzboon', org: 'Jadara University' }
      ]
    },
    {
      title: 'Publication',
      members: [
        { name: 'Fathey Mohammed', org: 'Sunway University' },
        { name: 'Nur Idora Abdul Razak', org: 'ComSoc/VTS' },
        { name: 'Nik Fatinah N. Mohd Farid', org: 'Universiti Utara Malaysia' }
      ]
    },
    {
      title: 'Technical & Logistic Committee',
      members: [
        { name: 'Fazli Azzali', org: 'Universiti Utara Malaysia' },
        { name: 'Mohd. Samsu Sajat', org: 'Universiti Utara Malaysia' },
        { name: 'Adi Affandi Ahmad', org: 'Universiti Utara Malaysia' },
        { name: 'Ahmad Hanis Mohd. Shabli', org: 'Universiti Utara Malaysia' }
      ]
    }
  ];

  filteredCommittees: Committee[] = [];

  ngOnInit() {
    this.filteredCommittees = JSON.parse(JSON.stringify(this.allCommittees));
  }

  ngOnChanges() {
    this.filterCommittee();
  }

  filterCommittee() {
    if (!this.searchTerm || this.searchTerm.trim() === '') {
      this.filteredCommittees = JSON.parse(JSON.stringify(this.allCommittees));
      return;
    }
    const term = this.searchTerm.toLowerCase();
    this.filteredCommittees = this.allCommittees.map(committee => {
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
