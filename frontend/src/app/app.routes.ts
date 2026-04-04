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

// 🌟 引入刚建好的子页面
import { Cybersecurity } from './pages/Research_explore/cybersecurity/cybersecurity';
import { Forensics } from './pages/Research_explore/forensics/forensics';
import { Iot } from './pages/Research_explore/iot/iot';
import { Ai } from './pages/Research_explore/ai/ai';
import { Cloud } from './pages/Research_explore/cloud/cloud';
import { Network } from './pages/Research_explore/network/network';

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

  { path: 'research', component: Research }, // Research 主页

  { path: 'resources', component: Resources },
  { path: 'people', component: People },
  { path: 'news', component: News },
  { path: 'forum', component: Forum },
  { path: 'contact', component: Contact },
  { path: 'login', component: Login },

  { path: 'conference/2024', component: Conference },
  { path: 'conference/2020', component: Conference },
  { path: 'conference/2017', component: Conference },
  { path: 'conference/proceedings', component: Conference }
];
