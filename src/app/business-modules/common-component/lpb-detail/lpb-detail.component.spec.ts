import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LpbDetailComponent } from './lpb-detail.component';

describe('LpbDetailComponent', () => {
  let component: LpbDetailComponent;
  let fixture: ComponentFixture<LpbDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LpbDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LpbDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
