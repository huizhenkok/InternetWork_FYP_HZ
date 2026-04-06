import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ForumActivity } from './forum-activity';

describe('ForumActivity', () => {
  let component: ForumActivity;
  let fixture: ComponentFixture<ForumActivity>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ForumActivity]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ForumActivity);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
