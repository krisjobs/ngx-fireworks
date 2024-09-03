import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheetRef } from '@angular/material/bottom-sheet';
import { debounceTime, map, Subscription } from 'rxjs';

// ===================== MODELS =====================

import { Entity } from 'functions/src/styleguide/models';
import { PanelData, ListItem, SectionConfig } from 'src/app/styleguide';

// ===================== SERVICES =====================

import { SECTION_CONFIG } from 'src/app/styleguide/services/app.providers';
import { EntityService } from '../../../services/entity.service';

// ===================== UTILITY =====================

// ===================== DEFINITIONS =====================

@Component({
  selector: 'fng-list-panel',
  standalone: true,
  templateUrl: './list-panel.component.html',
  styleUrls: ['./list-panel.component.scss']
})
export class ListPanelComponent implements OnInit {

  public formGroup!: FormGroup;

  private formValue: any;
  private lastSaved!: any;
  private lastEntity: Entity = JSON.parse(JSON.stringify(this.sheetData.entity));

  public get listItems(): ListItem[][] {
    return this.sheetData.items;
  }

  public get withButton() {
    return !!this.sheetData.withButton;
  }

  public get demoMode() {
    return !!this.sheetData.demoMode;
  }

  public get buttonDisabled() {
    return !!this.sheetData.buttonDisabled?.(this.entity);
  }

  public get buttonText() {
    return this.sheetData.buttonText;
  }

  private get flatListItems(): ListItem[] {
    return this.listItems
      .flat()
      .filter(item => item.contentType === 'input' || item.contentType === 'switch')
      .filter(item => !item.inactive?.(this.lastEntity));
  }

  public isFormValid(): boolean {
    return this.formGroup.valid;
  }

  public get entity(): Entity {
    const entity = JSON.parse(JSON.stringify(this.sheetData.entity));

    if (!this.formGroup) {
      return entity;
    }

    const formValue = this.formGroup.value;

    this.flatListItems
      .filter(item => !item.hidden?.(this.lastEntity, this.demoMode))
      .forEach(
        (item) => {
          let newValue = item.contentNumeric ?
            parseFloat(formValue[item.contentName!]) :
            formValue[item.contentName!];

          if (item.contentTransform) {
            newValue = item.contentTransform(newValue, this.lastEntity);
          }

          eval(`entity.${item.contentTarget} = newValue`);
        }
      )

    this.lastEntity = JSON.parse(JSON.stringify(entity));

    return entity;
  }

  private onChangeSub!: Subscription;

  constructor(
    @Inject(MAT_BOTTOM_SHEET_DATA) private sheetData: PanelData,
    @Inject(SECTION_CONFIG) private sectionConfig: SectionConfig,
    private sheetRef: MatBottomSheetRef<PanelComponent>,
    private formBuilder: FormBuilder,
    private entityService: EntityService,
  ) { }

  ngOnInit(): void {
    this.initFormGroup();
    this.initOnChange();
  }

  ngOnDestroy(): void {
    this.onChangeSub.unsubscribe();
  }

  private initFormGroup() {
    this.formGroup = this.formBuilder.group(
      this.flatListItems.reduce(
        (fields, item) => ({
          ...fields,
          [item.contentName!]: [
            {
              value: item.content(this.entity),
              disabled: false
            },
            item.contentValidators?.(this.entity)
          ]
        }),
        {}
      )
    );

    this.formGroup.markAllAsTouched();
  }

  private initOnChange() {
    this.onChangeSub?.unsubscribe();

    this.onChangeSub = this.formGroup.valueChanges.pipe(
      debounceTime(500),
      map(formValue => ({
        id: this.entity.id,
        path: this.entity.path,
        ...this.flatListItems
          .filter(item => !item.hidden?.(this.lastEntity, this.demoMode))
          .reduce(
            (fields, item) => {
              const rawValue = item.contentNumeric ?
                parseFloat(formValue[item.contentName!]) :
                formValue[item.contentName!];

              return {
                ...fields,
                [item.contentTarget!]: !item.contentTransform ?
                  rawValue :
                  item.contentTransform(rawValue, this.lastEntity)
              };
            },
            {}
          )
      } as Partial<Entity>)),
    ).subscribe({
      next: (entityUpdate) => {
        this.formValue = entityUpdate;

        this.initFormGroup();
        this.initOnChange();
      }
    });
  }

  public clearValue(formControlName: string) {
    this.formGroup.get(formControlName)?.patchValue(0);
  }

  public hasChange() {
    return JSON.stringify(this.formValue) !== JSON.stringify(this.lastSaved);
  }

  public saveEntity() {
    this.lastSaved = this.formValue;
    this.entityService.updateEntity(this.formValue);

    if (!!this.sheetData.closeOnSave) {
      this.sheetRef.dismiss();
    }
  }
}
