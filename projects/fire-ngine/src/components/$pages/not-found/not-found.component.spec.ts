import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AppNotFoundComponent } from './not-found.component';

describe('NotFoundComponent', () => {
  let component: AppNotFoundComponent;
  let fixture: ComponentFixture<AppNotFoundComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [AppNotFoundComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AppNotFoundComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
