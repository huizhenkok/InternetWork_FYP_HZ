import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminCms } from './admin-cms';

describe('AdminCms', () => {
  let component: AdminCms;
  let fixture: ComponentFixture<AdminCms>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminCms]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminCms);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
