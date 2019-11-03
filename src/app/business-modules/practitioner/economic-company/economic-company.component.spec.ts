import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EconomicCompanyComponent } from './economic-company.component';

describe('EconomicCompanyComponent', () => {
  let component: EconomicCompanyComponent;
  let fixture: ComponentFixture<EconomicCompanyComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EconomicCompanyComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EconomicCompanyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
