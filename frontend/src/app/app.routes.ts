import { Routes } from '@angular/router';
import { Home } from './pages/home/home';
import { Research } from './pages/research/research';
import { Resources } from './pages/resources/resources';
import { People } from './pages/people/people';
import { News } from './pages/news/news';
import { Conference } from './pages/conference/conference';
import { Forum } from './pages/forum/forum';
import { Contact } from './pages/contact/contact';
import { Login } from './pages/login/login';
import { ForgetPassword } from './pages/forget-password/forget-password';
import { SignUp } from './pages/sign-up/sign-up'; // 🌟 引入刚建好的注册页面

// 🌟 引入 Research 子页面
import { Cybersecurity } from './pages/Research_explore/cybersecurity/cybersecurity';
import { Forensics } from './pages/Research_explore/forensics/forensics';
import { Iot } from './pages/Research_explore/iot/iot';
import { Ai } from './pages/Research_explore/ai/ai';
import { Cloud } from './pages/Research_explore/cloud/cloud';
import { Network } from './pages/Research_explore/network/network';

import { ThreadDetail } from './pages/forum/thread-detail/thread-detail';

// 🌟 引入 Student 和 Alumni 的专属 Dashboard (如果之前建好了的话)
// import { Student } from './student-alumni/student-alumni';
// import { Alumni } from './student-alumni/student-alumni';

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: Home },

  // 🌟 Research 的所有子页面 (必须放在 'research' 前面)
  { path: 'research/cybersecurity', component: Cybersecurity },
  { path: 'research/forensics', component: Forensics },
  { path: 'research/iot', component: Iot },
  { path: 'research/ai', component: Ai },
  { path: 'research/cloud', component: Cloud },
  { path: 'research/network', component: Network },

  { path: 'research', component: Research },

  { path: 'resources', component: Resources },
  { path: 'people', component: People },
  { path: 'news', component: News },
  { path: 'forum', component: Forum },
  { path: 'forum/thread/:id', component: ThreadDetail },
  { path: 'contact', component: Contact },

  // 🌟 身份验证区域
  { path: 'login', component: Login },
  { path: 'sign-up', component: SignUp }, // 🌟 注册页面的路由加在这里！
  { path: 'forget-password', component: ForgetPassword },
  { path: 'conference', component: Conference }
];
