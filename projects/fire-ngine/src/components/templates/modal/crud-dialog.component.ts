import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { StepperSelectionEvent, STEPPER_GLOBAL_OPTIONS } from '@angular/cdk/stepper';
import { BehaviorSubject, combineLatest, delay, map, NEVER, switchMap, tap } from 'rxjs';
import { MatStepper } from '@angular/material/stepper';

// ===================== MODELS =====================

import { SectionConfig, CrudDialogData, CrudOperation, FormStep, QuerySettings, UrlEntities, UrlParams } from 'src/app/styleguide';
import { Entity, User } from 'functions/src/styleguide/models';

// ===================== UTILITY =====================

// ===================== SERVICES =====================

import { SECTION_CONFIG } from 'src/app/styleguide/services/app.providers';
import { EntityService } from '../../../services/entity.service';
import { EntityRepository } from '../../../services/entity.repository';
import { AuthService } from 'src/app/styleguide/modules/firebase/services/auth.service';
import { AppService } from 'src/app/styleguide/services/app.service';

// ===================== DEFINITIONS =====================


@Component({
  selector: 'lib-crud-dialog',
  templateUrl: './crud-dialog.component.html',
  styleUrls: ['./crud-dialog.component.scss'],
  providers: [
    {
      provide: STEPPER_GLOBAL_OPTIONS,
      useValue: { displayDefaultIndicatorType: false }
    },
  ]
})
export class CrudDialogComponent implements OnInit {

  public userRoles$ = this.authService.userRoles$$;

  public get title(): string {
    return this.dialogData.title;
  }

  public get activeFormIdx() {
    return this.entityService.activeFormIdx;
  }

  public getTemplateStepLabel(formIdx: number): string {
    return this.dialogData.templatesConfig?.templateStepLabels?.[formIdx] ?? `General ${this.displayName}`;
  }

  public getTemplateStepSublabel(formIdx: number): string | undefined {
    return this.dialogData.templatesConfig?.entitiesDisplay?.[formIdx](this.entities[formIdx]) ?? this.entities[formIdx]?.id;
  }

  public getTemplateStageName(formIdx: number): string {
    return this.dialogData.templatesConfig?.templateStageNames?.[formIdx]!;
  }

  public getTemplateStepColor(formIdx: number): any {
    return this.dialogData.templatesConfig?.templateStepColors?.[formIdx] ?? 'primary';
  }

  public getTemplateStepIcon(formIdx: number): string {
    return this.dialogData.templatesConfig?.templateStepIcons?.[formIdx] ?? 'edit';
  }

  public getTemplateCollection(formIdx: number): string | undefined {
    return this.dialogData.templatesConfig?.templateCollections?.[formIdx];
  }

  public get templateSettings(): QuerySettings[] {
    return this.entityService.entityConfig.templateSettings ?? [];
  }

  public get formStepLabel(): string {
    return `${this.displayName[0].toUpperCase() + this.displayName.slice(1)} form`;
  }

  public get templateStepIds() {
    return (this.dialogData.templatesConfig?.templateStepIcons ?? []).map(
      (_, idx) => `template${idx}`
    );
  }

  public get forRemove(): boolean {
    return this.operation === 'delete';
  }

  public get operation(): CrudOperation {
    return this.dialogData.operation;
  }

  public get steps(): FormStep[] {
    return this.dialogData.steps;
  }

  public get selectedFormIdx(): number | undefined {
    return this.dialogData.selectedFormIdx;
  }

  public get selectedStepIdx(): number | undefined {
    // TODO DOES NOT WORK
    return this.dialogData.selectedStepIdx;
  }

  public get context(): UrlEntities {
    return this.dialogData.context;
  }

  public get url(): UrlParams {
    return this.dialogData.url;
  }

  public get parent(): Entity | null | undefined {
    return this.context?.query;
  }

  public get displayName(): string {
    // TODO refactor displayName out of this component
    const [config, idx] = this.dialogData.config ?? [];
    const configName = config?.tabs[idx!].displayName;

    return configName ?? this.entityService.entityConfig.displayName;
  }

  public get saveButtonText(): string {
    return this.dialogData.saveButtonText ?? `Save ${this.entityService.entityConfig.displayName}`;
  }

  public get showTemplates(): boolean {
    return !!this.dialogData.showTemplates ||
      (!this.dialogData.hideTemplates &&
        (this.operation === 'create' && !!this.parent)
      );
  }

  public get newId(): string | undefined {
    return this.dialogData.operation === 'create' ? this.dialogData.newId : undefined;
  }

  public templateEntities$ = this.initTemplateEntities$();
  public formGroup!: FormGroup;

  private $isValid = new BehaviorSubject<boolean>(false);
  public isValid$ = this.$isValid.asObservable();
  public isValid(value: boolean) {
    this.$isValid.next(value);
  }

  private $value = new BehaviorSubject<any>({});
  public value$ = this.$value.asObservable();
  public value(value: any) {
    this.$value.next(value);
  }

  private $entity = new BehaviorSubject<Partial<Entity>>(this.dialogData.entity);
  public entity$ = this.$entity.pipe(
    // tap(console.warn)
  );

  private $entities = (this.entityService.entityConfig.templateSettings ?? []).map(
    () => new BehaviorSubject<Entity | null | undefined>(null)
  );

  public formContextEntities$ = this.dialogData.formContextIdx != undefined ?
    this.initContextEntities$(this.dialogData.formContextIdx) :
    NEVER;

  public entities$ = this.$entities.map(entity => entity.asObservable())

  public get entities() {
    return this.$entities.map($entity => $entity.value)
  }

  public resetDisabled$ = this.entity$.pipe(
    map(entity => JSON.stringify(entity) === JSON.stringify(this.initialEntity))
  );

  private initialEntity!: Partial<Entity>;

  @ViewChild('stepper', { read: MatStepper })
  public stepper!: MatStepper;

  private stopper = false;

  constructor(
    @Inject(MAT_DIALOG_DATA) private dialogData: CrudDialogData,
    @Inject(SECTION_CONFIG) private config: SectionConfig,
    private dialogRef: MatDialogRef<CrudDialogComponent>,
    private formBuilder: FormBuilder,
    private entityService: EntityService,
    private entityRepository: EntityRepository,
    private authService: AuthService,
    private appService: AppService,
  ) {
    this.initialEntity = JSON.parse(JSON.stringify(this.dialogData.entity));

    this.initForm();

    this.entityService.activeFormIdx = this.selectedFormIdx || 0;
  }

  ngOnInit(): void {
    this.$entity.next(this.dialogData.entity);

    // simulate entity selection if parentId in URL
    if (this.parent && this.dialogData.parentContextIdx) {
      this.onSelectEntity(
        this.parent,
        this.dialogData.parentContextIdx
      );

      this.entityService.setContextSettings(
        {
          selectedTemplateId: this.parent.id,
        },
        this.dialogData.parentContextIdx
      );
    }
  }

  private initForm(): void {
    this.formGroup = this.formBuilder.group({
      markedForArchive: this.formBuilder.control(
        false,
        [Validators.requiredTrue]
      ),
      markedForDelete: this.formBuilder.control({
        value: false, disabled: true
      })
    });
  }

  public resetForm(): void {
    const initialEntity = JSON.parse(JSON.stringify(this.initialEntity));

    this.stopper = false;

    this.entityService.resetContextSettings();

    this.$entity.next(initialEntity);

    this.$entities.forEach(
      $entity => $entity.next(null)
    );

    this.entityService.activeFormIdx = 0;
  }

  public closeForm(): void {
    this.dialogRef.close();
  }

  public saveEntity(formValue: Entity) {
    const entity = {
      ...(this.$entity.value),
      ...formValue
    };

    this.dialogRef.close(entity);
  }

  public removeEntity(formValue: any) {
    const {
      markedForDelete
    } = formValue;

    this.dialogData.markedForDelete = markedForDelete;

    this.dialogRef.close(this.$entity.value);
  }

  public onConfirm({ checked }: MatSlideToggleChange) {
    if (checked) {
      this.formGroup.get('markedForDelete')?.enable();
    } else {
      this.formGroup.get('markedForDelete')?.disable();
    }
  }

  public onSelectEntity(entity: Entity, formIdx: number) {
    const entities = [
      ...this.entities,
    ];

    const oldEntities: (Entity | null)[] = JSON.parse(JSON.stringify(entities));

    let rawEntity: Entity | null;

    if (this.entityService.contextSettings.selectedTemplateId === entity.id) {
      this.entityService.contextSettings = {
        selectedTemplateId: undefined,
      };

      rawEntity = null;
    } else {
      this.entityService.contextSettings = {
        selectedTemplateId: entity.id
      };

      rawEntity = entity;
    }

    entities[formIdx] = rawEntity;

    const nextEntity = this.dialogData.templatesConfig?.entityAssembly?.(entities, this.initialEntity, this.$value.value) ?? rawEntity ?? this.initialEntity;
    // console.warn(nextEntity)
    this.$entity.next(nextEntity!);

    const newEntities = this.dialogData.templatesConfig?.entitiesCancel?.(oldEntities, entities) ?? entities;

    newEntities.forEach(
      (entity, idx) => {
        this.$entities[idx].next(entity);

        if (!entity) {
          this.entityService.setContextSettings({
            selectedTemplateId: undefined,
          }, idx);
        }
      }
    );

    // also check if stepper exist due to race condition
    if (!!rawEntity && !!this.stepper) {
      this.stepper.selectedIndex = formIdx + 1;
    }
  }

  public onFormIndexChange($event: StepperSelectionEvent) {
    const newIndex = $event.selectedIndex;

    if (!this.stopper && newIndex === this.templateSettings.length) {
      this.stopper = true;
    }

    this.entityService.activeFormIdx = newIndex;
  }

  private initContextEntities$(stepIdx: number) {
    const templatesCollection = this.getTemplateCollection(stepIdx);
    return (!!templatesCollection ?
      this.entityService.templateSettings$.pipe(
        switchMap(settings => {
          return this.entityRepository.getEntities$(
            `${templatesCollection}`,
            {
              ...settings,
              viewFilters: {
                ...settings.viewFilters,
                ...(this.dialogData.templatesConfig?.viewFilters?.({
                  entities: this.entities,
                })[stepIdx] ?? {})
              }
            },
          )
        }),
      ) :
      NEVER
    )
  }

  private initTemplateEntities$() {

    return combineLatest([
      this.entityService._templateSettings$,
      this.entityRepository.getEntity$$(
        this.authService.currentUser!.uid, // TODO REFACTOR IN A SERVICE
        'users'
      ),
    ])
      .pipe(
        switchMap(([[settings, formIdx], currentUser]) => {
          const templatesCollection = this.getTemplateCollection(formIdx);
          return (!!templatesCollection ?
            this.entityRepository.getEntities$(
              `${templatesCollection}`,
              {
                ...settings,
                viewFilters: {
                  ...settings.viewFilters,
                  ...(this.dialogData.templatesConfig?.viewFilters?.({
                    entities: this.entities,
                    context: this.context,
                  })[formIdx] ?? {})
                }
              },
            ).pipe(
              switchMap(
                (entities) => this.entityService.contextSettings$.pipe(
                  map(settings => this.entityRepository.sortEntities(entities, settings.sort)),
                )
              ),
              delay(250),
              tap(entities => {
                // entities.map(entity => entity.id).includes(this.authService.currentUser!.uid)

                const preselectEntity = this.dialogData.templatesConfig?.preselectStrategy?.(currentUser as User, entities, this.parent, this.entities);

                if ((entities.length === 1 || !!preselectEntity?.[this.entityService.activeFormIdx]) && !this.stopper) {
                  this.entityService.contextSettings = {
                    selectedTemplateId: entities.length === 1 ?
                      entities[0].id :
                      preselectEntity?.[this.entityService.activeFormIdx]?.id
                  };

                  this.$entities[this.entityService.activeFormIdx].next(entities.length === 1 ? entities[0] : preselectEntity![this.entityService.activeFormIdx]);
                }

                const nextEntity = this.dialogData.templatesConfig?.entityAssembly?.(this.entities, this.initialEntity, this.$value.value) ?? this.initialEntity;

                this.$entity.next(nextEntity);
              }),
              delay(450),
              tap(entities => {
                const preselectEntity = this.dialogData.templatesConfig?.preselectStrategy?.(currentUser as User, entities, this.parent, this.entities);

                if ((entities.length === 1 || !!preselectEntity?.[this.entityService.activeFormIdx]) && !this.stopper) {
                  this.stepper.selectedIndex = this.entityService.activeFormIdx + 1;
                } else {
                  this.stopper = true;
                }
              }),
            ) :
            NEVER
          )
        }
        )
      );
  }
}
