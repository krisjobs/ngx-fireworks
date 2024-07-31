import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CrudDialogComponent } from './crud-dialog.component';

describe('SaveDialogComponent', () => {
  let component: CrudDialogComponent;
  let fixture: ComponentFixture<CrudDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [CrudDialogComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CrudDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
