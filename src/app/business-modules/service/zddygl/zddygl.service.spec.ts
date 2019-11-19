import { TestBed } from '@angular/core/testing';

import { ZddyglService } from './zddygl.service';

describe('ZddyglService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: ZddyglService = TestBed.get(ZddyglService);
    expect(service).toBeTruthy();
  });
});
