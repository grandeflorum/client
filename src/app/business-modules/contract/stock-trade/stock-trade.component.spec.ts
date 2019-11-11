import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StockTradeComponent } from './stock-trade.component';

describe('StockTradeComponent', () => {
  let component: StockTradeComponent;
  let fixture: ComponentFixture<StockTradeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StockTradeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StockTradeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
