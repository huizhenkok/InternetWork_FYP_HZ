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
import { SignUp } from './pages/sign-up/sign-up';

// 🌟 Research 子页面
import { Cybersecurity } from './pages/Research_explore/cybersecurity/cybersecurity';
import { Forensics } from './pages/Research_explore/forensics/forensics';
import { Iot } from './pages/Research_explore/iot/iot';
import { Ai } from './pages/Research_explore/ai/ai';
import { Cloud } from './pages/Research_explore/cloud/cloud';
import { Network } from './pages/Research_explore/network/network';
import { ThreadDetail } from './pages/forum/thread-detail/thread-detail';

// 🌟 Student/Alumni 共用的身份判定页面
import { StudentAlumni } from './student-alumni/student-alumni';

// 🌟 内部功能页面
import { MyProfile } from './student-alumni/my-profile/my-profile';
import { Booking } from './student-alumni/booking/booking';
import { ForumActivity } from './student-alumni/forum-activity/forum-activity';
import { Publication } from './student-alumni/publication/publication';

// 注意：BookingModal 不需要在这里注册！

export const routes: Routes = [
  { path: '', redirectTo: '/home', pathMatch: 'full' },
  { path: 'home', component: Home },

  // Research 区域
  { path: 'research/cybersecurity', component: Cybersecurity },
  { path: 'research/forensics', component: Forensics },
  { path: 'research/iot', component: Iot },
  { path: 'research/ai', component: Ai },
  { path: 'research/cloud', component: Cloud },
  { path: 'research/network', component: Network },
  { path: 'research', component: Research },

  // 公共页面区域
  { path: 'resources', component: Resources },
  { path: 'people', component: People },
  { path: 'news', component: News },
  { path: 'forum', component: Forum },
  { path: 'forum/thread/:id', component: ThreadDetail },
  { path: 'contact', component: Contact },
  { path: 'conference', component: Conference },

  // 身份验证区域
  { path: 'login', component: Login },
  { path: 'sign-up', component: SignUp },
  { path: 'forget-password', component: ForgetPassword },

  // 🌟 学生/校友核心 Dashboard 路由
  { path: 'student', component: StudentAlumni, data: { role: 'Student' } },
  { path: 'alumni', component: StudentAlumni, data: { role: 'Alumni' } },

  // 🌟 内部子系统路由
  { path: 'my-profile', component: MyProfile },
  { path: 'booking', component: Booking },
  { path: 'forum-activity', component: ForumActivity },
  { path: 'publication', component: Publication }
];
