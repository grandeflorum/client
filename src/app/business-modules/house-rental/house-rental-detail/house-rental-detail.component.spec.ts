import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HouseRentalDetailComponent } from './house-rental-detail.component';

describe('HouseRentalDetailComponent', () => {
  let component: HouseRentalDetailComponent;
  let fixture: ComponentFixture<HouseRentalDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HouseRentalDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HouseRentalDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
