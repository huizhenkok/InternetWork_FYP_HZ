import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Expert {
  name: string;
  expertise: string[];
  email: string;
  office: string;
}

interface ExpertSection {
  title: string;
  members: Expert[];
}

@Component({
  selector: 'app-directory',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './directory.html'
})
export class Directory implements OnChanges {
  @Input() searchTerm: string = '';

  // 🌟 注入你提供的完整专家数据
  allSections: ExpertSection[] = [
    {
      title: 'Professor',
      members: [
        {
          name: 'Prof. Ts. Dr. Suhaidi Hassan',
          expertise: ['Networked Computing', 'Internet Architecture and Protocols', 'Internet Governance and Informatics'],
          email: 'suhaidi@uum.edu.my',
          office: '+604 928 5293'
        }
      ]
    },
    {
      title: 'Associate Professor',
      members: [
        {
          name: 'Assoc. Prof. Dr. Osman Ghazali',
          expertise: ['Cloud Computing', 'Network Protocols', 'Network Security'],
          email: 'osman@uum.edu.my',
          office: '+604 - 928 5052'
        },
        {
          name: 'Assoc. Prof. Dr. Massudi Mahmuddin',
          expertise: ['Bio-inspired Optimisation', 'Distributed Computing', 'Expert System'],
          email: 'ady@uum.edu.my',
          office: '+604 - 928 5300'
        },
        {
          name: 'Assoc. Prof. Madya Ts. Dr. Mohd Hasbullah Omar',
          expertise: ['Cognitive Radio Networks', 'Wireless Sensor Network', 'Wireless Communication'],
          email: 'mhomar@uum.edu.my',
          office: '+604 - 928 5089'
        },
        {
          name: 'Assoc. Prof. Dr. Nur Hayani Zakaria',
          expertise: ['Usable Security', 'Authentication Systems', 'Information Security Training & Awareness'],
          email: 'haryani@uum.edu.my',
          office: '+604 - 928 5252'
        },
        {
          name: 'Assoc. Prof. Ts. Dr Norliza Katuk',
          expertise: ['Internet Security and Privacy', 'Web system authentication', 'Engagement in web-based learning'],
          email: 'haryani@uum.edu.my',
          office: '+604 - 928 5252'
        }
      ]
    },
    {
      title: 'Senior Lecturer',
      members: [
        {
          name: 'Dr. Ahmad Suki Che Mohamed Ariff',
          expertise: ['Mobile Computing', 'Computer Networks', 'Distributed Computing'],
          email: 'suki1207@uum.edu.my',
          office: '+604 - 928 5074'
        },
        {
          name: 'Dr. Shahrudin Awang Nor',
          expertise: ['Computer Networks', 'Distributed Systems', 'Network Security'],
          email: 'shah@uum.edu.my',
          office: '+604 - 928 5196'
        },
        {
          name: 'Dr. Amran Ahmad',
          expertise: ['Wireless Network Security', 'Network Management', 'Web Application Development'],
          email: 'amran@uum.edu.my',
          office: '+604 - 928 5054'
        },
        {
          name: 'Dr. Fazli Azzali',
          expertise: ['Vehicular Networks', 'Media Independent Handover', 'Wireless Networks'],
          email: 'fazli@uum.edu.my',
          office: '+604 - 928 5145'
        },
        {
          name: 'Dr. Baharudin Osman',
          expertise: ['Information Security', 'Soft Computing', 'System Security'],
          email: 'bahaosman@uum.edu.my',
          office: '+604 - 928 5147'
        },
        {
          name: 'Dr. Mohd Nizam Omar',
          expertise: ['Intrusion Detection System', 'Tracing Intruder', 'Stepping Stone Detection'],
          email: 'niezam@uum.edu.my',
          office: '+604 - 928 5103'
        },
        {
          name: 'Mohd Samsu Bin Sajat',
          expertise: ['Wireless Network', 'Internet Protocol', 'Social Media'],
          email: 'mohdsamsu@uum.edu.my',
          office: '+604 - 928 5161'
        },
        {
          name: 'Dr. Khuzairi Mohd. Zaini',
          expertise: ['Common radio resource management (CRRM)', 'Network performance analysis'],
          email: 'khuzairi@uum.edu.my',
          office: '+604 - 928 5197'
        },
        {
          name: 'Dr. Noradila Nordin',
          expertise: ['Wireless Sensor Networks'],
          email: 'nnoradila@uum.edu.my',
          office: '+604 - 928 5158'
        },
        {
          name: 'Dr. Yousef Ali Fazea Alnadesh',
          expertise: ['Optical Communications & Optoelectronics', 'Optical Computing and channel modeling', 'Signal-Processing, deep/machine learning'],
          email: 'yosiffz@uum.edu.my',
          office: '+604 - 928 5XXX'
        },
        {
          name: 'Dr. Zainab Senan Mahmod Attar Bashi',
          expertise: ['Device-to-device - Communication', 'Wireless Networking', 'Network Mobility'],
          email: 'zainab.senan@uum.edu.my',
          office: '+604 - 928 5XXX'
        }
      ]
    }
  ];

  filteredSections: ExpertSection[] = [];

  ngOnInit() {
    this.filteredSections = JSON.parse(JSON.stringify(this.allSections));
  }

  ngOnChanges() {
    this.filterExperts();
  }

  filterExperts() {
    if (!this.searchTerm || this.searchTerm.trim() === '') {
      this.filteredSections = JSON.parse(JSON.stringify(this.allSections));
      return;
    }

    const term = this.searchTerm.toLowerCase();

    // 支持按名字或研究领域搜索
    this.filteredSections = this.allSections.map(section => {
      return {
        title: section.title,
        members: section.members.filter(m =>
          m.name.toLowerCase().includes(term) ||
          m.expertise.some(exp => exp.toLowerCase().includes(term)) // 🌟 搜索领域
        )
      };
    }).filter(section => section.members.length > 0);
  }
}
