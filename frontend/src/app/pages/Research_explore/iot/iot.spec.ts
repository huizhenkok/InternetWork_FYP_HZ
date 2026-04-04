import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Iot } from './iot';

describe('Iot', () => {
  let component: Iot;
  let fixture: ComponentFixture<Iot>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Iot]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Iot);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
