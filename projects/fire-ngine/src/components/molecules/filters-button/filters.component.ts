import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { debounceTime, map, Subscription } from 'rxjs';

// ===================== MODELS =====================

import { FormField, EntityFilter, SelectOption, AutocompleteGroup, UrlEntities } from 'src/app/styleguide';
import { UserRole } from 'functions/src/styleguide/models';

// ===================== UTILITY =====================

// ===================== DEFINITIONS =====================

@Component({
  selector: 'lib-filters',
  templateUrl: './filters.component.html',
  styleUrls: ['./filters.component.scss']
})
export class FiltersComponent implements OnInit {

  @Input()
  public context!: UrlEntities;

  @Input()
  public roles!: UserRole;

  @Input()
  public forTemplates: boolean = false;

  @Input('fields')
  public set initFields(fields: FormField[]) {

    if (fields === undefined) {
      return;
    }

    this.fields = fields;

    this.onChangeSub?.unsubscribe();
    this.initFormGroup();
    this.initOnChange();
  }
  public fields: FormField[] = [];

  @Input('filters')
  public set initFilters(filters: EntityFilter[]) {
    this._filters = filters;

    if (filters === undefined) {
      return;
    }

    const filtersMap = new Map<string, EntityFilter>();

    filters.forEach(
      (filter) => {
        filtersMap.set(filter.name, filter)
      },
    );

    this.filters = filtersMap;

    this.onChangeSub?.unsubscribe();
    this.initFormGroup();
    this.initOnChange();
  }
  private _filters!: EntityFilter[];
  private filters!: Map<string, EntityFilter>;

  // outputs must be defined in constructor, while inputs get available onInit
  @Output()
  public onChange = new EventEmitter<EntityFilter[]>();
  private onChangeSub!: Subscription;

  public formGroup!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
  ) { }

  ngOnInit(): void {
    this.initFormGroup();
    this.initOnChange();
  }

  ngOnDestroy(): void {
    this.onChangeSub.unsubscribe();
  }

  private isDisabled(fieldName: string): boolean {
    const isDisabled = this.filters?.get(fieldName)?.equality === false &&
      !!this.fields
        .filter(
          field => this.filters?.get(field.name)?.equality === false && field.name !== fieldName
        )
        .find(
          field => !!this.filters?.get(field.name)!.value
        );

    return isDisabled;
  }

  public clearValue(formControlName: string) {
    this.formGroup.get(formControlName)?.patchValue(null);
  }

  private initFormGroup() {
    this.formGroup = this.formBuilder.group({
      ...(this.fields
        .filter(field => !field.hidden?.({
          data: !!this.context?.query,
          roles: this.roles,
          flag: this.forTemplates
        }))
        .reduce(
          (formFields, field) => ({
            ...formFields,
            [field.name]: [
              {
                value: field.value?.(this.filters?.get(field.name)?.value as any) ?? this.filters?.get(field.name)?.value,
                disabled: this.isDisabled(field.name)
              },
              field.validators
            ]
          }),
          {}
        ))
    })
  }

  private initOnChange() {
    this.onChangeSub = this.formGroup.valueChanges
      .pipe(
        debounceTime(500),
        map(formValueMap => this._filters.map(
          (filter, idx) => ({
            ...filter,
            value: (this.fields[idx].subtype === 'number' ?
              formValueMap[filter.name] && parseFloat(formValueMap[filter.name]) :
              this.fields[idx].type === 'select' ?
                formValueMap[filter.name] :
                !formValueMap[filter.name] ?
                  null :
                  (this.fields[idx].value?.(formValueMap[filter.name] as any)?.toLowerCase() ?? (formValueMap[filter.name] as string)?.toLowerCase())
            )
              ?? null
          })
        ))
      )
      .subscribe({
        next: (filters: EntityFilter[]) => {
          filters.forEach(
            filter => {
              if (!filter.value && filter.value !== null) {
                this.clearValue(filter.name);
              }
            }
          );

          this.onChange.emit(filters);
        }
      });
  }

  public preventDefault($event: any) {
    $event.stopPropagation();
  }

  public trackByOptions(index: number, option: SelectOption) {
    return `${index}.${option.name}.${option.value}`;
  }

  public trackByOptionGroup(index: number, group: AutocompleteGroup) {
    return `${index}.${group.label}`;
  }
}
