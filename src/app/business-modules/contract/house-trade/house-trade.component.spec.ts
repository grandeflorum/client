import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HouseTradeComponent } from './house-trade.component';

describe('HouseTradeComponent', () => {
  let component: HouseTradeComponent;
  let fixture: ComponentFixture<HouseTradeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HouseTradeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HouseTradeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
