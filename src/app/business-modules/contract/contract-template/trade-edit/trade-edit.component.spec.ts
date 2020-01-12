import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { TradeEditComponent } from './trade-edit.component';

describe('TradeEditComponent', () => {
  let component: TradeEditComponent;
  let fixture: ComponentFixture<TradeEditComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ TradeEditComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(TradeEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
