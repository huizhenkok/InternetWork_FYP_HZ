import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Alumni } from './alumni';

describe('Alumni', () => {
  let component: Alumni;
  let fixture: ComponentFixture<Alumni>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Alumni]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Alumni);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
