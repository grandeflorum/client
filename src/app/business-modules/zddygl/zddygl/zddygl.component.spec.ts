import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ZddyglComponent } from './zddygl.component';

describe('ZddyglComponent', () => {
  let component: ZddyglComponent;
  let fixture: ComponentFixture<ZddyglComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ZddyglComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ZddyglComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
