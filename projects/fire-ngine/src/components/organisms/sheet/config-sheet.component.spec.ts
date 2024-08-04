import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConfigSheetComponent } from './config-sheet.component';

describe('ConfigSheetComponent', () => {
  let component: ConfigSheetComponent;
  let fixture: ComponentFixture<ConfigSheetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ConfigSheetComponent]
    })
      .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ConfigSheetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
