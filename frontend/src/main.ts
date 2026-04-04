import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

// 🌟 核心：确保 App 和 appConfig 被同时启动！
bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));
