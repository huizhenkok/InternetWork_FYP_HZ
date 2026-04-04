import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Forensics } from './forensics';

describe('Forensics', () => {
  let component: Forensics;
  let fixture: ComponentFixture<Forensics>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Forensics]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Forensics);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
