import { ComponentFixture, TestBed } from '@angular/core/testing';

import { Objective } from './objective';

describe('Objective', () => {
  let component: Objective;
  let fixture: ComponentFixture<Objective>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Objective]
    })
    .compileComponents();

    fixture = TestBed.createComponent(Objective);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
