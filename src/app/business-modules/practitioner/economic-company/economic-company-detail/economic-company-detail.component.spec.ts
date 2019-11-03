import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EconomicCompanyDetailComponent } from './economic-company-detail.component';

describe('EconomicCompanyDetailComponent', () => {
  let component: EconomicCompanyDetailComponent;
  let fixture: ComponentFixture<EconomicCompanyDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EconomicCompanyDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EconomicCompanyDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
