import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FireNgineComponent } from './fire-ngine.component';

describe('FireNgineComponent', () => {
  let component: FireNgineComponent;
  let fixture: ComponentFixture<FireNgineComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FireNgineComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FireNgineComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
