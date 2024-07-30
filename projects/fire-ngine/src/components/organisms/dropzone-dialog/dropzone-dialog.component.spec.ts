import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DropzoneDialogComponent } from './dropzone-dialog.component';

describe('DropzoneDialogComponent', () => {
  let component: DropzoneDialogComponent;
  let fixture: ComponentFixture<DropzoneDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DropzoneDialogComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DropzoneDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
