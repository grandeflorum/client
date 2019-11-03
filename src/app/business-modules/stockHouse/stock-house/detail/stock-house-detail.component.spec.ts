import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StockHouseDetailComponent } from './stock-house-detail.component';

describe('StockHouseDetailComponent', () => {
  let component: StockHouseDetailComponent;
  let fixture: ComponentFixture<StockHouseDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StockHouseDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StockHouseDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
