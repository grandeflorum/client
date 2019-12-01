import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AssociatedCompanyComponent } from './associated-company.component';

describe('AssociatedCompanyComponent', () => {
  let component: AssociatedCompanyComponent;
  let fixture: ComponentFixture<AssociatedCompanyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AssociatedCompanyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AssociatedCompanyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
