import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DropzoneModalComponent } from './dropzone-modal.component';

describe('DropzoneModalComponent', () => {
  let component: DropzoneModalComponent;
  let fixture: ComponentFixture<DropzoneModalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [DropzoneModalComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(DropzoneModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
