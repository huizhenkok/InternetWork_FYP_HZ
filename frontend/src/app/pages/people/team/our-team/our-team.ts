import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

// 定义人员的数据结构
interface TeamMember {
  name: string;
  role: string;
}

// 定义层级（部门）的数据结构
interface TeamSection {
  title: string;
  members: TeamMember[];
}

@Component({
  selector: 'app-our-team',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './our-team.html'
})
export class OurTeam implements OnChanges {
  // 🌟 接收来自主页面 people 的搜索词
  @Input() searchTerm: string = '';

  // 🌟 将你发给我的资料进行严谨的多层级分类
  allSections: TeamSection[] = [
    {
      title: 'Management Board',
      members: [
        { name: 'Prof. Ts. Dr. Suhaidi Hasaan', role: 'Chairman' },
        { name: 'Assoc. Prof. Madya Ts. Dr. Mohd Hasbullah Omar', role: 'Lab and Website Manager' },
        { name: 'Dr. Noradila Nordin', role: 'Secretariat and Research Manager' },
        { name: 'Dr. Yousef Fazea', role: 'Publication Manager' },
        { name: 'Dr. Shahrudin Awang Nor', role: 'Treasurer' }
      ]
    },
    {
      title: 'Activity Coordinators',
      members: [
        { name: 'Dr. Mohd Nizam Omar', role: 'Activity Coordinator' },
        { name: 'Dr. Zainab Senan Mahmod', role: 'Activity Coordinator' },
        { name: 'Ts. Adi Affandi Ahmad', role: 'Activity Coordinator' },
        { name: 'Ahmad Hanis Mohd Shabli', role: 'Activity Coordinator' },
        { name: 'Dr. Fazli Azzali', role: 'Activity Coordinator' },
        { name: 'Mohd Samsu Sajat', role: 'Activity Coordinator' },
        { name: 'Ts. Ali Yusny Daud', role: 'Activity Coordinator' },
        { name: 'Dr. Baharudin Osman', role: 'Activity Coordinator' }
      ]
    },
    {
      title: 'Other Exco Members (Ex-Officio)',
      members: [
        { name: 'Assoc. Prof. Dr. Osman Ghazali', role: 'Exco Member' },
        { name: 'Dr. Massudi Mahmuddin', role: 'Exco Member' },
        { name: 'Dr. Ahmad Suki Che Mohamed Ariff', role: 'Exco Member' },
        { name: 'Dr. Amran Ahmad', role: 'Exco Member' },
        { name: 'Dr. Nur Haryani Zakaria', role: 'Exco Member' },
        { name: 'Dr. Norliza Katuk', role: 'Exco Member' },
        { name: 'Dr. Khuzairi Mohd. Zaini', role: 'Exco Member' },
        { name: 'Suwannit Chareen Chit', role: 'Exco Member' }
      ]
    }
  ];

  // 用于在页面上显示的数组（会被搜索词过滤）
  filteredSections: TeamSection[] = [];

  ngOnInit() {
    // 刚进页面时，显示所有人
    this.filteredSections = JSON.parse(JSON.stringify(this.allSections));
  }

  // 🌟 当主页面的 searchTerm 发生变化时，瞬间触发过滤！
  ngOnChanges() {
    this.filterMembers();
  }

  filterMembers() {
    if (!this.searchTerm || this.searchTerm.trim() === '') {
      this.filteredSections = JSON.parse(JSON.stringify(this.allSections));
      return;
    }

    const term = this.searchTerm.toLowerCase();

    // 魔法：保留匹配的人，如果某个部门都没人匹配，就把那个部门隐藏
    this.filteredSections = this.allSections.map(section => {
      return {
        title: section.title,
        members: section.members.filter(m =>
          m.name.toLowerCase().includes(term) ||
          m.role.toLowerCase().includes(term)
        )
      };
    }).filter(section => section.members.length > 0);
  }
}
