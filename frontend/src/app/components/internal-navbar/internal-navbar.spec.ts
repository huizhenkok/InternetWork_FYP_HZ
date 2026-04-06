import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InternalNavbar } from './internal-navbar';

describe('InternalNavbar', () => {
  let component: InternalNavbar;
  let fixture: ComponentFixture<InternalNavbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InternalNavbar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InternalNavbar);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
