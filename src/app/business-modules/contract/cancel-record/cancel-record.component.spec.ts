import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CancelRecordComponent } from './cancel-record.component';

describe('CancelRecordComponent', () => {
  let component: CancelRecordComponent;
  let fixture: ComponentFixture<CancelRecordComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CancelRecordComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CancelRecordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
