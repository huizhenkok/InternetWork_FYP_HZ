import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConferenceTeam } from './conference-team';

describe('ConferenceTeam', () => {
  let component: ConferenceTeam;
  let fixture: ComponentFixture<ConferenceTeam>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConferenceTeam]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ConferenceTeam);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
