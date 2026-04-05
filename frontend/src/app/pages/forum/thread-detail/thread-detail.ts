import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms'; // 🌟 引入表单模块，用来抓取你输入的内容

@Component({
  selector: 'app-thread-detail',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule], // 🌟 加入 FormsModule
  templateUrl: './thread-detail.html'
})
export class ThreadDetail implements OnInit {
  threadId: string = '';
  isDemoThread: boolean = false;

  // 🌟 用来装你即将在输入框里打字的变量
  newReplyContent: string = '';

  demoData = {
    title: 'Notice: SOC Server Maintenance & UUM-WiFi Upgrade',
    author: '@UUM_IT_Admin',
    role: 'Lab Admin',
    tag: 'Official',
    timeAgo: '2 hours ago',
    views: '1.2k',
    content: `
      Dear INWLab Researchers and Students,

      Please be informed that the School of Computing (SOC) IT Department will be conducting scheduled maintenance on our core database servers this weekend.

      During this period, the **UUM-WiFi** access points within the INWLab (Rooms 201 - 205) will also undergo firmware upgrades to support higher concurrent bandwidth for your IoT and network simulation experiments.

      **Downtime Window:**
      - **Start:** Saturday, Nov 9, 2026, 02:00 AM (MYT)
      - **End:** Saturday, Nov 9, 2026, 04:00 AM (MYT)

      If your PhD simulations or heavy data-scraping scripts are running on the local server nodes, please ensure they are paused or safely backed up before the downtime. Local network switches will remain active, but external internet access will be unstable.

      For critical issues, ping the network team on the emergency channel.
    `,
    replies: [
      {
        id: 1,
        author: '@Postgrad_Ahmad',
        role: 'MSc Student',
        timeAgo: '1 hour ago',
        content: 'Noted with thanks. Quick question: will the VPN access to the specific simulation server (Node-A) be affected during this window? I have a 48-hour epoch training running.',
        icon: 'school'
      },
      {
        id: 2,
        author: '@UUM_IT_Admin',
        role: 'Lab Admin',
        timeAgo: '45 mins ago',
        content: '@Postgrad_Ahmad Yes, VPN access will be intermittently disconnected. I highly recommend checkpointing your model training by Friday night to avoid data corruption.',
        icon: 'campaign'
      }
    ]
  };

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    this.threadId = this.route.snapshot.paramMap.get('id') || '';
    this.isDemoThread = this.threadId === 'uum-wifi-upgrade';
    window.scrollTo(0, 0);
  }

  // 🌟 处理点击发帖的核心函数
  postReply() {
    // 检查是不是没打字就按了发送
    if (this.newReplyContent.trim() === '') {
      alert("Please write something before posting!");
      return;
    }

    // 制造一条新的回复数据 (模拟是你自己发的)
    const newReply = {
      id: Date.now(), // 随便生成一个 ID
      author: '@Current_User', // 假装是你当前的账号
      role: 'Researcher',
      timeAgo: 'Just now',
      content: this.newReplyContent,
      icon: 'person' // 你的头像图标
    };

    // 把这条新回复塞进回复列表的最下面
    this.demoData.replies.push(newReply);

    // 清空输入框
    this.newReplyContent = '';
  }
}
