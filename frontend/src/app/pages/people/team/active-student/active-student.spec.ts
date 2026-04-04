import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ActiveStudent } from './active-student';

describe('ActiveStudent', () => {
  let component: ActiveStudent;
  let fixture: ComponentFixture<ActiveStudent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActiveStudent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ActiveStudent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
