import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StockHouseComponent } from './stock-house.component';

describe('StockHouseComponent', () => {
  let component: StockHouseComponent;
  let fixture: ComponentFixture<StockHouseComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StockHouseComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StockHouseComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
