import { Component, OnInit, Inject, PLATFORM_ID } from '@angular/core';
import { CommonModule, isPlatformBrowser } from '@angular/common';
import { CmsService } from '../../../../services/cms.service'; // 🌟 遵循你的指引：子组件跳 4 层！

@Component({
  selector: 'app-objective',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './objective.html'
})
export class Objective implements OnInit {
  cmsData: any = {};

  // 将默认数据提取出来，方便复用
  defaultData = {
    mainTitle: 'University Objectives',
    paragraph1: 'Universiti Utara Malaysia was established to primarily develop...',
    paragraph2: 'Universiti Utara Malaysia also acts as a catalyst...',
    paragraph3: 'In addition to its core business...',
    thrustsTitle: 'Three Major Thrusts',
    thrust1: 'To be the centre of excellence for management education.',
    thrust2: 'To be the leading referral centre in all aspects of management scholarship and practice.',
    thrust3: 'To be the premier resource centre in the field of management studies.'
  };

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
    private cmsService: CmsService // 🌟 注入 CmsService
  ) {}

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {

      // 🌟 核心修改：从 MySQL 获取 About 数据，然后提取 objective 节点
      this.cmsService.getCmsData('inwlab_cms_about').subscribe({
        next: (res: any) => {
          try {
            const parsed = JSON.parse(res.contentJson);
            this.cmsData = parsed.objective || this.defaultData;
          } catch(e) {
            console.error("Error parsing Objective CMS", e);
            this.cmsData = this.defaultData;
          }
        },
        error: () => this.cmsData = this.defaultData
      });

      window.scrollTo(0, 0);
    }
  }

  // 加入了安全校验 (|| '') 防止初始化时文字为空导致报错
  get titleFirstPart(): string {
    const words = (this.cmsData.mainTitle || '').trim().split(' ');
    return words.length <= 1 ? (this.cmsData.mainTitle || '') : words.slice(0, -1).join(' ');
  }
  get titleLastPart(): string {
    const words = (this.cmsData.mainTitle || '').trim().split(' ');
    return words.length <= 1 ? '' : words[words.length - 1];
  }
}
