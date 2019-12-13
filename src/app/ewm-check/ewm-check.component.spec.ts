import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EwmCheckComponent } from './ewm-check.component';

describe('EwmCheckComponent', () => {
  let component: EwmCheckComponent;
  let fixture: ComponentFixture<EwmCheckComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EwmCheckComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EwmCheckComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
