import { STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatChipEvent, MatChipInputEvent } from '@angular/material/chips';
import { debounceTime, Subscription } from 'rxjs';

// ===================== MODELS =====================

import { AutocompleteGroup, FormField, FormStep, SelectOption, UrlEntities, UrlParams } from 'src/app/styleguide';
import { Entity, UserRole } from 'functions/src/styleguide/models';

// ===================== UTILITY =====================

// ===================== SERVICES =====================

import { EntityService } from '../../../services/entity.service';

// ===================== DEFINITIONS =====================


// TODO refactor form fields to separate form components

@Component({
  selector: 'fng-form',
  standalone: true,
  templateUrl: './form.component.html',
  styleUrls: ['./form.component.scss'],
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: { showError: true },
    },
  ],
})
export class FormComponent implements OnInit {

  @Input()
  public steps!: FormStep[];

  @Input()
  public newId?: string;

  @Input()
  public set entity(value: Partial<Entity>) {
    this.formEntity = value;

    this.initFormGroup(this.formEntity);
    this.initFormListener();
  }

  @Input()
  public contextEntities: Entity[] | null = null;

  @Input()
  public roles!: UserRole;

  public formEntity!: Partial<Entity>

  @Input()
  public context!: UrlEntities;

  @Input()
  public url!: UrlParams;

  @Input()
  public selectedIdx?: number;

  @Output()
  public isValid = new EventEmitter<boolean>();

  @Output()
  public value = new EventEmitter<any>();

  @Output()
  public onEnter = new EventEmitter<any>();

  @Output()
  public onEscape = new EventEmitter<void>();

  public get selectedFormIdx() {
    return this.selectedIdx ?? this.entityService.entityConfig.entitySettings.selectedFormIdx;
  }

  public formGroup!: FormGroup;

  public get imagePath(): string {
    return `images/${this.formEntity.attributes!.type}/${this.newId ?? this.formEntity.id}`;
  }

  public getFilePath(field: FormField): string {
    return field.uploadPath?.({
      entity: this.formEntity as any,
      url: this.url
    }) ?? this.imagePath
  }

  private valueChangeSub!: Subscription;

  constructor(
    protected formBuilder: FormBuilder,
    private entityService: EntityService,
  ) { }

  ngOnInit(): void {
    this.initFormGroup(this.formEntity);
    this.initFormListener();
  }

  ngOnDestroy(): void {
    this.valueChangeSub.unsubscribe();
  }

  public clearValue(stepName: string, fieldName: string) {
    this.formGroup.get(`${stepName}.${fieldName}`)?.patchValue(null);
  }

  public onImageUpload(stepName: string, fieldName: string, downloadUrl: string) {
    this.formGroup.get(`${stepName}.${fieldName}`)?.patchValue(downloadUrl);
  }

  public onExpansionClick($event: Event) {
    $event.preventDefault();
    $event.stopPropagation();
  }

  public initFormListener() {
    this.valueChangeSub?.unsubscribe();

    this.valueChangeSub = this.formGroup.valueChanges
      .pipe(
        debounceTime(500),
      )
      .subscribe({
        next: () => this.onFormValueChange(this.formGroup.getRawValue())
      })

    this.isValid.emit(this.formGroup.valid);
    this.value.emit(this.formGroup.getRawValue());
  }

  public onFormValueChange(value: any) {
    this.formEntity = {
      ...this.formEntity,
      ...value
    };

    // console.warn(`[onFormValueChange] ===>`, this.formEntity)

    this.initFormGroup(this.formEntity);
    this.initFormListener();
  }

  private isDisabled(field: FormField, entity: Partial<Entity>): boolean {
    return !!field.disabled?.({
      entity: entity as Entity,
      roles: this.roles
    });
  }

  public getHint(field: FormField) {
    return field.hint!({
      entity: this.formEntity as Entity,
      context: this.context,
      data: this.contextEntities
    });
  }

  private getFormFieldValue(field: FormField, entity: Partial<Entity>, data?: string) {
    let rawValue = field.value({
      entity: entity as Entity,
      context: this.context,
      data: this.contextEntities
    });

    if (field.type === 'input') {
      if (!!rawValue && field.subtype === 'number') {
        return parseFloat(rawValue);
      }
    } else if (field.type === 'date') {
      if (!!rawValue && rawValue instanceof Date === false) {
        return rawValue.toDate();
      }
    } else if (field.type === 'daterange') {
      if (data === 'from') {
        rawValue = rawValue?.from;
      } else if (data === 'to') {
        rawValue = rawValue?.to;
      }

      if (!!rawValue && rawValue instanceof Date === false) {
        return rawValue.toDate();
      }
    }

    return rawValue;
  }

  private initFormGroup(entity: Partial<Entity>) {
    this.formGroup = this.formBuilder.group(
      {
        ...(this.steps.reduce(
          (formGroup, step) => ({
            ...formGroup,
            ...(!step.invisible?.({
              entity: entity as Entity,
              roles: this.roles,
              // context: this.co,

            }) && {
              [step.name]: this.formBuilder.group(
                {
                  ...(step.fields.reduce(
                    (formGroupFields, field) => ({
                      ...formGroupFields,
                      ...(!field.hidden?.({
                        entity: entity as Entity,
                        roles: this.roles,
                      }) &&
                        (field.type !== 'daterange' ?
                          {
                            [field.name]: [
                              {
                                value: this.getFormFieldValue(field, entity),
                                disabled: this.isDisabled(field, entity)
                              },
                              field.validators?.({
                                entity: entity as Entity
                              })
                            ]
                          } :
                          {
                            [field.name]: this.formBuilder.group({
                              from: [
                                {
                                  value: this.getFormFieldValue(field, entity, 'from'),
                                  disabled: this.isDisabled(field, entity)
                                },
                                field.validators?.({
                                  entity: entity as Entity
                                })
                              ],
                              to: [
                                {
                                  value: this.getFormFieldValue(field, entity, 'to'),
                                  disabled: this.isDisabled(field, entity)
                                },
                                field.validators?.({
                                  entity: entity as Entity
                                })
                              ],
                            })
                          })
                      ),
                    }),
                    {}
                  ))
                }
              )
            })
          }),
          {}
        ))
      }
    )
  }

  public getOptions(fieldName: string) {
    if (!this.context?.query) {
      return [];
    }

    const optionsPath = this.getOptionsPath(fieldName)

    return eval(`this.parent?.${optionsPath}`) as any[] ?? [];
  }

  public getOptionsPath(fieldName: string) {
    const optionsPath = this.entityService.entityConfig.optionsPath[fieldName];

    return optionsPath;
  }

  public addKeywordFromInput(event: MatChipInputEvent, fieldName: string) {
    const optionsPath = this.getOptionsPath(fieldName)

    if (event.value && !!this.context?.query && !!optionsPath) {
      let subscribers = this.getOptions(fieldName);
      const subscriberId = event.value;
      const isSubscribed = subscribers.includes(subscriberId);
      // console.warn(subscribers, isSubscribed, optionsPath, this.entityService.entityConfig.optionsPath, fieldName)

      if (!isSubscribed) {
        subscribers.push(subscriberId);
      } else {
        subscribers = subscribers.filter(id => id !== subscriberId);
      }

      const characterUpdate = {
        ...this.context.query,
        [optionsPath]: subscribers,
      };

      this.entityService.updateEntity(characterUpdate);

      event.chipInput!.clear();
    }
  }

  public removeKeyword(keyword: string, fieldName: string, $event: MatChipEvent) {
    const optionsPath = this.getOptionsPath(fieldName)

    let subscribers = this.getOptions(fieldName)
      .filter(id => id !== keyword);

    const characterUpdate = {
      ...this.context?.query,
      [optionsPath]: subscribers,
    };

    console.warn(optionsPath, subscribers, characterUpdate)

    this.entityService.updateEntity(characterUpdate);

    // $event.chip.focus();
    // this.keywords.delete(keyword);
  }

  public trackByOptions(index: number, option: SelectOption) {
    return `${index}.${option.name}.${option.value}.${this.context?.query?.stats.updatedAt.seconds}`;
  }

  public trackByOptionGroup(index: number, group: AutocompleteGroup) {
    return `${index}.${group.label}`;
  }

  public saveEntity($event: Event) {
    $event.preventDefault();

    this.onEnter.emit(this.formGroup.getRawValue());
  }

  public closeForm($event: Event) {
    $event.preventDefault();

    this.onEscape.emit();
  }

  // TODO workaround
  public getFormEntity(): Entity {
    return this.formEntity as Entity;
  }
}
