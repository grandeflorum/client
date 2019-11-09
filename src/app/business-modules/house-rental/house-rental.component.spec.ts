import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HouseRentalComponent } from './house-rental.component';

describe('HouseRentalComponent', () => {
  let component: HouseRentalComponent;
  let fixture: ComponentFixture<HouseRentalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HouseRentalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HouseRentalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
