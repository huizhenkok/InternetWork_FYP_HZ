import { Component, Input, OnChanges } from '@angular/core';
import { CommonModule } from '@angular/common';

interface AlumniMember {
  name: string;
  designation: string;
  organization: string;
}

interface AlumniYear {
  year: string;
  members: AlumniMember[];
}

declare var AOS: any;

@Component({
  selector: 'app-alumni',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './alumni.html'
})
export class Alumni implements OnChanges {
  @Input() searchTerm: string = '';

  allYears: AlumniYear[] = [
    {
      year: '2018',
      members: [
        { name: 'Musa Sule Argungu', designation: 'Lecturer', organization: 'Kebbi State University, Nigeria' },
        { name: 'Kawakib Khadyair Ahmed', designation: 'Chief Programmer', organization: 'Ministry of Science and Technology, Iraq' }
      ]
    },
    {
      year: '2017',
      members: [
        { name: 'Walid Elbreiki', designation: 'Lecturer', organization: 'Benghazi Educational Zone, Libya' },
        { name: 'Atheer Flayh Hassan Al-Khamees', designation: 'Head of Computer & Information Eng. Dep.', organization: 'Alhussain University College' },
        { name: 'Raaid Nasur Kadham Alubady', designation: 'Lecturer', organization: 'University of Babylon, Iraq' },
        { name: 'Shivaleela Arlimatti', designation: 'Associate Professor', organization: 'Shaikh College of Engineering & Technology, India' },
        { name: 'Mowafaq Salem Alzboon', designation: 'Head of Computer & Information Eng. Dep.', organization: 'Jadara University, Jordan' },
        { name: 'Swetha Indudhar Goudar', designation: 'Associate Professor', organization: 'KLS Gogte Institute of Technology, India' },
        { name: 'Omar Dakkak', designation: 'Associate Professor', organization: 'Karabük University, Turkey' },
        { name: 'Yousef Fazea', designation: 'Visiting Senior Lecturer', organization: 'School of Computing, Universiti Utara Malaysia' }
      ]
    },
    {
      year: '2016',
      members: [
        { name: 'Ibrahim Abdullahi', designation: 'Lecturer', organization: 'Ibrahim Badamasi Babangida University, Nigeria' },
        { name: 'Ikram Ud Din', designation: 'Lecturer', organization: 'The University of Haripur, Pakistan' },
        { name: 'Mohamed Fazil Mohamed Firdhous', designation: 'Senior Lecturer / Consultant', organization: 'University of Moratuwa / Asian Development Bank' }
      ]
    },
    {
      year: '2015',
      members: [
        { name: 'Amran Ahmad', designation: 'Head of CS Dept. / Senior Lecturer', organization: 'School of Computing, Universiti Utara Malaysia' },
        { name: 'Nadher Mohammed Alsafwani', designation: 'Consultant', organization: 'ITU Regional Cybersecurity Center, Oman' }
      ]
    },
    {
      year: '2014',
      members: [
        { name: 'Adib Habbal', designation: 'Associate Professor', organization: 'Karabuk University, Turkey' }
      ]
    },
    {
      year: '2012',
      members: [
        { name: 'Mohd. Hasbullah Omar', designation: 'Associate Professor', organization: 'School of Computing, Universiti Utara Malaysia' },
        { name: 'Shahrudin Awang Nor', designation: 'Senior Lecturer', organization: 'School of Computing, Universiti Utara Malaysia' }
      ]
    },
    {
      year: '2011',
      members: [
        { name: 'Ahmad Suki Che Mohamed Arif', designation: 'Senior Lecturer', organization: 'School of Computing, Universiti Utara Malaysia' }
      ]
    },
    {
      year: '2010',
      members: [
        { name: 'Omar Mohammad Al-Momani', designation: 'Associate Professor', organization: 'The World Islamic Sciences & Education University' }
      ]
    },
    {
      year: '2008',
      members: [
        { name: 'Osman Ghazali', designation: 'Deputy Dean / Associate Professor', organization: 'School of Computing, Universiti Utara Malaysia' }
      ]
    }
  ];

  filteredYears: AlumniYear[] = [];

  ngOnInit() {
    this.filteredYears = JSON.parse(JSON.stringify(this.allYears));
  }

  ngOnChanges() {
    this.filterAlumni();
  }

  filterAlumni() {
    if (!this.searchTerm || this.searchTerm.trim() === '') {
      this.filteredYears = JSON.parse(JSON.stringify(this.allYears));
      return;
    }
    const term = this.searchTerm.toLowerCase();
    this.filteredYears = this.allYears.map(yearGroup => {
      return {
        year: yearGroup.year,
        members: yearGroup.members.filter(m =>
          m.name.toLowerCase().includes(term) ||
          m.designation.toLowerCase().includes(term) ||
          m.organization.toLowerCase().includes(term) ||
          yearGroup.year.includes(term) // 连毕业年份都能搜！
        )
      };
    }).filter(yearGroup => yearGroup.members.length > 0);

    setTimeout(() => {
      if (typeof AOS !== 'undefined') AOS.refresh();
    }, 50);
  }
}
