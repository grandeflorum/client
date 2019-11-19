import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ZddyglDetailComponent } from './zddygl-detail.component';

describe('ZddyglDetailComponent', () => {
  let component: ZddyglDetailComponent;
  let fixture: ComponentFixture<ZddyglDetailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ZddyglDetailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ZddyglDetailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
