import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FreeformComponent } from './freeform-view.component';

describe('FreeformComponent', () => {
  let component: FreeformComponent;
  let fixture: ComponentFixture<FreeformComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ FreeformComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(FreeformComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
