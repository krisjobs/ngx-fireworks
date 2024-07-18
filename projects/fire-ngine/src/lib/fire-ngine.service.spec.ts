import { TestBed } from '@angular/core/testing';

import { FireNgineService } from './fire-ngine.service';

describe('FireNgineService', () => {
  let service: FireNgineService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FireNgineService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
