import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentAlumni } from './student-alumni';

describe('StudentAlumni', () => {
  let component: StudentAlumni;
  let fixture: ComponentFixture<StudentAlumni>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentAlumni]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentAlumni);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
