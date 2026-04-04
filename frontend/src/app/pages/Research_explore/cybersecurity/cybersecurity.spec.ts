import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Cybersecurity } from './cybersecurity';

describe('Cybersecurity', () => {
  let component: Cybersecurity;
  let fixture: ComponentFixture<Cybersecurity>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Cybersecurity]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Cybersecurity);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
