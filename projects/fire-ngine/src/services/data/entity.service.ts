import { Inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Timestamp, QueryDocumentSnapshot } from '@angular/fire/firestore';
import { PageEvent } from '@angular/material/paginator';
import { BehaviorSubject, combineLatest, filter, from, map, NEVER, Observable, of, switchMap, tap } from 'rxjs';

// ===================== MODELS =====================

import {
  Entity, StarRating
} from 'functions/src/styleguide/models';

import {
  SortType, PaginatorSettings, SectionConfig, CrudDialogData,
  ViewSettings, QuerySettings, EntityAction, EntityConfig,
  ConfigSheetData, SortSettings, UrlParams
} from 'src/app/styleguide';

// ===================== UTILITY =====================

import { environment } from 'src/environments/environment';

import { getParamsFromUrl } from 'src/app/styleguide/utility';

// ===================== SERVICES =====================

import { SECTION_CONFIG } from 'src/app/styleguide/services/app.providers';
import { NotificationService } from 'src/app/styleguide/services/notification.service';
import { EntityRepository } from './entity.repository';
import { UserService } from '../../users/services/user.service';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { AppService } from 'src/app/styleguide/services/app.service';
import { AuthService } from '../../firebase/services/auth.service';

// ===================== COMPONENTS =====================

import { ConfigSheetComponent } from '../components/organisms/config-sheet/config-sheet.component';
import { CrudDialogComponent } from '../components/organisms/crud-dialog/crud-dialog.component';

// ===================== DEFINITIONS =====================

/**
 * * if you can import EntityService <=> you have access to entityConfig
 */
@Injectable()
export class EntityService {

  private $activeTabIdx = new BehaviorSubject<number>(JSON.parse(
    localStorage.getItem(
      `${this.sectionConfig.sectionKey}.activeTabIdx`
    ) || '0'
  ));
  private $activeFormIdx = new BehaviorSubject<number>(JSON.parse(
    localStorage.getItem(
      `${this.sectionConfig.sectionKey}.activeFormIdx`
    ) || '0'
  ));
  public activeTabIdx$ = this.$activeTabIdx.asObservable();
  public activeFormIdx$ = this.$activeFormIdx.asObservable();

  public get activeTabIdx(): number {
    return this.$activeTabIdx.value;
  }

  public get activeFormIdx(): number {
    return this.$activeFormIdx.value;
  }

  public set activeTabIdx(value: number) {
    this.$activeTabIdx.next(value);

    this.querySettings = {
      sectionFilters: this.sectionConfig.sectionFilters ?? [],
      tabFilters: this.entityConfig.tabFilters ?? []
    };

    localStorage.setItem(
      `${this.sectionConfig.sectionKey}.activeTabIdx`,
      JSON.stringify(value)
    );
  }

  public set activeFormIdx(value: number) {
    if (value < (this.entityConfig.templateSettings ?? []).length) {
      this.$activeFormIdx.next(value);
    } else {
      return;
    }

    // this.querySettings = {
    //   sectionFilters: this.sectionConfig.sectionFilters ?? [],
    //   tabFilters: this.entityConfig.tabFilters ?? []
    // };

    localStorage.setItem(
      `${this.sectionConfig.sectionKey}.activeFormIdx`,
      JSON.stringify(value)
    );
  }

  private $viewSettings = this.sectionConfig.tabs.map(
    (tab, idx) => new BehaviorSubject<ViewSettings>({
      ...tab.viewSettings,
      ...JSON.parse(
        localStorage.getItem(
          `${this.sectionConfig.sectionKey}.${this.entityConfig.descriptor}.viewSettings.${idx}`
        ) || '{}'
      )
    })
  );

  private $querySettings = this.sectionConfig.tabs.map(
    (tab, idx) => new BehaviorSubject<QuerySettings>({
      ...tab.querySettings,
      ...JSON.parse(
        localStorage.getItem(
          `${this.sectionConfig.sectionKey}.${this.entityConfig.descriptor}.querySettings.${idx}`
        ) || '{}'
      )
    })
  );

  private $templateSettings = this.sectionConfig.tabs.map(
    (tab, tabIdx) => (tab.templateSettings ?? []).map(
      (settings, formIdx) => new BehaviorSubject<QuerySettings>({
        ...settings,
        ...JSON.parse(
          localStorage.getItem(
            `${this.sectionConfig.sectionKey}.${this.entityConfig.descriptor}.templateSettings.${tabIdx}.${formIdx}`
          ) || '{}'
        )
      })
    )
  );

  private $contextSettings = this.sectionConfig.tabs.map(
    (tab, tabIdx) => (tab.contextSettings ?? []).map(
      (settings, formIdx) => new BehaviorSubject<ViewSettings>({
        ...settings,
        ...JSON.parse(
          localStorage.getItem(
            `${this.sectionConfig.sectionKey}.${this.entityConfig.descriptor}.contextSettings.${tabIdx}.${formIdx}`
          ) || '{}'
        )
      })
    )
  );

  public viewSettings$ = combineLatest([
    this.activeTabIdx$,
    this.appService.currentUrl$,
    this.authService.userRoles$$
  ]).pipe(
    switchMap(
      ([activeTabIdx, url, roles]) => this.$viewSettings[activeTabIdx].pipe(
        map(
          viewSettings => {
            if (!!this.entityConfig.viewSettingsStrategy) {
              return {
                ...viewSettings,
                ...this.entityConfig.viewSettingsStrategy({
                  url: getParamsFromUrl(url),
                  roles
                })
              }
            }

            return viewSettings;
          }
        )
      )
    )
  );

  public querySettings$ = this.activeTabIdx$.pipe(
    switchMap(
      activeTabIdx => this.$querySettings[activeTabIdx].asObservable()
    )
  );

  public _templateSettings$ = combineLatest([
    this.activeTabIdx$,
    this.activeFormIdx$,
  ]).pipe(
    switchMap(
      ([activeTabIdx, activeFormIdx]) => (this.$templateSettings[activeTabIdx][activeFormIdx]?.asObservable() ?? of(null)).pipe(
        map(
          settings => [settings, activeFormIdx] as [QuerySettings, number]
        )
      )
    ),
  );

  public templateSettings$ = this._templateSettings$.pipe(
    map(
      ([settings]) => settings
    )
  );

  public contextSettings$ = combineLatest([
    this.activeTabIdx$,
    this.activeFormIdx$,
    this.appService.currentUrl$,
  ]).pipe(
    switchMap(
      ([activeTabIdx, activeFormIdx, url]) => this.$contextSettings[activeTabIdx][activeFormIdx]?.asObservable() ?? of(null).pipe(
        map(
          viewSettings => {
            // if (!!this.entityConfig.viewSettingsStrategy) {
            //   return {
            //     ...viewSettings,
            //     ...this.entityConfig.viewSettingsStrategy(url)
            //   }
            // }

            return viewSettings;
          }
        )
      )
    )
  );

  public get viewSettings(): ViewSettings {
    return this.$viewSettings[this.activeTabIdx].value;
  }

  public get querySettings(): QuerySettings {
    return this.$querySettings[this.activeTabIdx].value;
  }

  public get templateSettings(): QuerySettings {
    return this.$templateSettings[this.activeTabIdx][this.activeFormIdx]?.value;
  }

  public get contextSettings(): ViewSettings {
    return this.getContextSettings();
  }

  public getContextSettings(formIdx = this.activeFormIdx): ViewSettings {
    return this.$contextSettings[this.activeTabIdx][formIdx]?.value;
  }

  public set viewSettings(viewSettings: Partial<ViewSettings>) {
    const {
      ...defaultSettings
    } = this.entityConfig.viewSettings;

    const newSettings = !!viewSettings ?
      {
        ...this.viewSettings,
        ...viewSettings
      } :
      {
        ...this.viewSettings,
        ...defaultSettings,
      };

    this.$viewSettings[this.activeTabIdx].next(newSettings);

    localStorage.setItem(
      `${this.sectionConfig.sectionKey}.${this.entityConfig.descriptor}.viewSettings.${this.activeTabIdx}`,
      JSON.stringify(newSettings)
    );
  }

  public set querySettings(querySettings: Partial<QuerySettings>) {
    const {
      paginator,
      tabFilters,
      sectionFilters,
      ...defaultSettings
    } = this.entityConfig.querySettings;

    const newSettings = !!querySettings ?
      {
        ...this.querySettings,
        ...querySettings
      } :
      {
        ...this.querySettings,
        ...defaultSettings
      };

    this.$querySettings[this.activeTabIdx].next(newSettings);

    localStorage.setItem(
      `${this.sectionConfig.sectionKey}.${this.entityConfig.descriptor}.querySettings.${this.activeTabIdx}`,
      JSON.stringify(newSettings)
    );
  }

  public set templateSettings(templateSettings: Partial<QuerySettings>) {
    const {
      paginator,
      tabFilters,
      sectionFilters,
      ...defaultSettings
    } = this.entityConfig.templateSettings![this.$activeFormIdx.value];

    const newSettings: QuerySettings = !!templateSettings ?
      {
        ...this.templateSettings,
        ...templateSettings
      } :
      {
        ...this.templateSettings,
        ...defaultSettings
      };

    this.$templateSettings[this.activeTabIdx][this.$activeFormIdx.value].next(newSettings);

    localStorage.setItem(
      `${this.sectionConfig.sectionKey}.${this.entityConfig.descriptor}.templateSettings.${this.activeTabIdx}.${this.activeFormIdx}`,
      JSON.stringify(newSettings)
    );
  }

  public set contextSettings(templateSettings: Partial<ViewSettings>) {
    this.setContextSettings(templateSettings);
  }

  public setContextSettings(templateSettings: Partial<ViewSettings>, formIdx = this.activeFormIdx) {
    const {
      ...defaultSettings
    } = this.entityConfig.contextSettings![this.$activeFormIdx.value];

    const newSettings: ViewSettings = !!templateSettings ?
      {
        ...this.getContextSettings(),
        ...templateSettings
      } :
      {
        ...this.getContextSettings(),
        ...defaultSettings
      };

    localStorage.setItem(
      `${this.sectionConfig.sectionKey}.${this.entityConfig.descriptor}.contextSettings.${this.activeTabIdx}.${this.activeFormIdx}`,
      JSON.stringify(newSettings)
    );
    this.$contextSettings[this.activeTabIdx][formIdx].next(newSettings);
  }

  public get entityConfig(): EntityConfig {
    return this.sectionConfig.tabs[this.activeTabIdx];
  }

  public entityConfig$: Observable<EntityConfig> = this.activeTabIdx$.pipe(
    map(idx => this.sectionConfig.tabs[idx])
  );

  public get templateConfig(): EntityConfig | undefined {
    return this.sectionConfig.templates?.[this.activeFormIdx];
  }

  public tableQuickAction$: Observable<EntityAction> = !!this.entityConfig.documentActions.length ?
    this.viewSettings$.pipe(
      map(viewsSettings => this.getAction(viewsSettings.tableQuickActionId))
    ) :
    NEVER;

  public cardQuickAction$: Observable<EntityAction> = !!this.entityConfig.documentActions.length ?
    this.viewSettings$.pipe(
      map(viewsSettings => this.getAction(viewsSettings.cardQuickActionId))
    ) :
    NEVER;

  public toolbarPinnedAction$: Observable<EntityAction> = !!this.entityConfig.collectionActions.length ?
    this.viewSettings$.pipe(
      map(viewsSettings => this.getPinnedAction(viewsSettings.toolbarPinnedActionId))
    ) :
    NEVER;

  public resetTemplateSettings() {
    this.$templateSettings.forEach(
      $templateSettings => {
        const nextValue = this.entityConfig.templateSettings![this.activeTabIdx];
        $templateSettings.forEach(
          (_, formIdx) => {
            this.$templateSettings[this.activeTabIdx][formIdx].next(nextValue);
          }
        );
      }
    );
  }

  public resetContextSettings() {
    this.$contextSettings.forEach(
      $contextSettings => {
        const nextValue = this.entityConfig.contextSettings![this.activeTabIdx];
        $contextSettings.forEach(
          (_, formIdx) => {
            this.$contextSettings[this.activeTabIdx][formIdx].next(nextValue);
          }
        );
      }
    );
  }

  constructor(
    @Inject(SECTION_CONFIG) private sectionConfig: SectionConfig,
    protected userService: UserService,
    private authService: AuthService,
    private appService: AppService,
    private notificationService: NotificationService,
    private repository: EntityRepository,
    private dialog: MatDialog,
    private sheet: MatBottomSheet,
  ) {
  }

  public getTargetPathFromUrl(url: UrlParams): string {
    if (!!this.entityConfig.bypassTargetPath) {
      return this.entityConfig.firestorePath;
    }

    const {
      moduleName,
      rootType,
      rootId,
      nestedType,
      nestedId,
      queryType,
      queryId,
    } = url;

    if (!!rootType && !!rootId) {
      if (!this.sectionConfig.related) {
        console.error(this.sectionConfig);
        throw new Error(`No parent config for type ${rootType}`);
      }

      const {
        config,
        entityIdx
      } = this.sectionConfig.related[rootType];
      const parentPath = config.tabs[entityIdx].firestorePath;
      const entityPath = this.entityConfig.firestorePath;

      if (!!nestedType && !!nestedId) {
        return `${parentPath}/${rootId}/${nestedType}/${nestedId}/${entityPath}`;
      }

      if (!!queryType && !!queryId && nestedType === 'media') {
        const {
          config: queryConfig,
          entityIdx: queryEntityIdx,
        } = this.sectionConfig.related[queryType];

        const queryParentPath = queryConfig.tabs[queryEntityIdx].firestorePath;

        return `${queryParentPath}/${queryId}/${rootType}/${rootId}/${entityPath}`;
      }

      return `${parentPath}/${rootId}/${entityPath}`;
    } else if (!!nestedType && !!nestedId) {
      if (!this.sectionConfig.related) {
        console.error(this.sectionConfig);
        throw new Error(`No parent config for type ${rootType}`);
      }

      const {
        config,
        entityIdx,
      } = this.sectionConfig.related[nestedType];
      const parentPath = config.tabs[entityIdx].firestorePath;

      const entityPath = this.entityConfig.firestorePath;

      return `${parentPath}/${nestedId}/${entityPath}`;
    } else if (!!queryType && !!queryId) {
      if (!this.sectionConfig.related) {
        console.error(this.sectionConfig);
        throw new Error(`No parent config for type ${rootType}`);
      }

      const {
        config,
        entityIdx,
      } = this.sectionConfig.related[queryType];
      const parentPath = config.tabs[entityIdx].firestorePath;

      const entityPath = this.entityConfig.firestorePath;

      return `${parentPath}/${queryId}/${entityPath}`;
    } else {
      return this.entityConfig.firestorePath;
    }
  }

  public getPinnedAction(actionId: string) {
    const pinnedAction = this.entityConfig.collectionActions.find(
      action => action.id === actionId
    );

    if (pinnedAction) {
      return pinnedAction;
    } else {
      throw new Error(`Invalid  collection actionId -> ${actionId}`);
    }
  }

  public getAction(actionId: string) {
    const action = this.entityConfig.documentActions.concat(this.entityConfig.collectionActions).find(
      action => action.id === actionId
    );

    if (action) {
      return action;
    } else {
      throw new Error(`Invalid actionId -> ${actionId}`);
    }
  }

  public isDefaultQuery(): boolean {
    const {
      paginator: paginator1,
      tabFilters: tabFilters1,
      sectionFilters: sectionFilters1,
      ...settings1
    } = this.querySettings;

    const {
      paginator: paginator2,
      tabFilters: tabFilters2,
      sectionFilters: sectionFilters2,
      ...settings2
    } = this.entityConfig.querySettings;

    // console.warn(settings1)
    // console.warn(settings2)
    return JSON.stringify(settings1) !== JSON.stringify(settings2);
  }

  public isDefaultTemplateQuery(): boolean {
    const {
      paginator: paginator1,
      tabFilters: tabFilters1,
      sectionFilters: sectionFilters1,
      ...settings1
    } = this.templateSettings;

    const {
      paginator: paginator2,
      tabFilters: tabFilters2,
      sectionFilters: sectionFilters2,
      ...settings2
    } = this.entityConfig.templateSettings![this.$activeFormIdx.value];

    // console.warn('isDefaultTemplateQuery-1', settings1)
    // console.warn('isDefaultTemplateQuery-2', settings2)
    return JSON.stringify(settings1) !== JSON.stringify(settings2);
  }

  public getRawEntity(parent?: Entity, sectionAsType = false): Partial<Entity> {
    const now = Timestamp.now();

    if (!this.authService.currentUser) {
      const message = 'You are not authorozied for this operation';
      this.notificationService.error(message);
      throw new Error(message);
    }

    // const reminderDate = new Date();
    // reminderDate.setFullYear(nowDate.getFullYear() + 1);
    // const reminder = Timestamp.fromDate(reminderDate);

    const targetPath = `${this.entityConfig.firestorePath}`;
    const targetId = this.repository.getNewDocId(targetPath);
    const uid = this.authService.loggedUser.uid;

    return {
      id: targetId,
      attributes: {
        isArchived: false,
        isDefault: false,
        isSelected: false,
        isSuggested: false,
        isActive: false,

        originId: null,
        relatedId: null,
        ownerId: null,
        parentId: parent?.id ?? null,

        rating: StarRating.star_outline,
        type: !sectionAsType ? this.entityConfig.descriptor : this.sectionConfig.sectionKey,
        class: !sectionAsType ? null : this.entityConfig.descriptor,
        category: null,
      },
      stats: {
        version: environment.version,
        createdAt: now,
        createdBy: uid,
        updatedAt: null!, // used for creation-time logic
        updatedBy: uid,
      },
      data: {
        subscribers: [uid],
      }
    } as Partial<Entity>;
  }

  public openCrudDialog(dialogData: CrudDialogData) {
    const dialogRef = this.dialog.open(
      CrudDialogComponent, {
      data: dialogData
    });

    const newId = dialogData.newId

    dialogRef.afterClosed()
      .pipe(
        tap(() => this.appService.loadingOn()),
        filter((result: Entity | null) => !!result),
        map((result) => dialogData.onRequest ? dialogData.onRequest(result as Entity) : result as Entity),

        switchMap((entity) => {
          if (dialogData.customRequest$) {
            return this.appService.showLoaderUntilCompleted(dialogData.customRequest$(entity, dialogData));
          }

          switch (dialogData.operation) {
            case 'create': {
              const {
                targetPath,
                subcollections,
                copySubcollectionAttributes,
                pathOverride,
              } = dialogData;

              return this.repository.createEntity$(
                entity,
                this.entityConfig.firestorePath,
                newId,
                pathOverride ?? targetPath,
                subcollections,
                copySubcollectionAttributes
              );
            }
            case 'update': {
              return this.repository.editEntity$(
                entity,
              );
            }
            case 'delete': {
              const {
                markedForDelete,
                subcollections
              } = dialogData;

              return this.repository.removeEntity$(
                entity,
                markedForDelete,
                subcollections
              );
            }
            default:
              throw new Error('Invalid operation.')
          }
        }),

        // finalize(() => this.appService.loadingOff())
      )
      .subscribe({
        next: (entity) => {
          // this.appService.loadingOn();

          dialogData.onResponse?.(entity);

          console.warn(entity)

          const successMessage = `${dialogData.operation} ${this.entityConfig.descriptor} success.`;
          console.log(successMessage);
          this.notificationService.message('Sucess.');
          // this.appService.loadingOff();
        },
        error: (error: Error) => {
          const errorMessage = `${dialogData.operation} ${this.entityConfig.descriptor} error:\n=======\n\n${error.message}`;
          console.error(errorMessage, dialogData);
          this.notificationService.error('Error!');
        },
        complete: () => {
          console.log(`${dialogData.operation} dialog closed...`);
          this.appService.loadingOff();
        }
      });
  }

  public createNewEntityDialog(entity?: Partial<Entity>, customData?: Partial<CrudDialogData>) {
    const parentConfig = customData?.config;
    const newEntity = this.getRawEntity(customData?.context?.query!, !!customData?.sectionAsType);

    console.warn('createNewEntityDialog ===>\n', newEntity, entity)

    const dialogData = {
      operation: 'create',
      entity: {
        ...newEntity,
        ...entity,
      },
      newId: entity?.id ?? newEntity.id,
      title: `${!!entity ? 'Copy' : 'Create new'} ${!parentConfig ? this.entityConfig.displayName : parentConfig[0].tabs[parentConfig[1]].displayName}`,
      steps: !parentConfig ? this.entityConfig.formSteps : parentConfig[0].tabs[parentConfig[1]].formSteps,
      ...customData
    } as CrudDialogData;

    this.openCrudDialog(dialogData);
  }

  public editEntityDialog(entity: Entity, customData?: Partial<CrudDialogData>) {
    const now = Timestamp.now();

    const parentConfig = customData?.config;

    const dialogData = {
      selectedFormIdx: 0,
      operation: 'update',
      entity: {
        ...entity,
        stats: {
          ...entity.stats,
          updatedAt: now,
          updatedBy: this.authService.loggedUser.uid,
        }
      },
      title: `Edit ${!parentConfig ? this.entityConfig.displayName : parentConfig[0].tabs[parentConfig[1]].displayName}`,
      steps: !parentConfig ? this.entityConfig.formSteps : parentConfig[0].tabs[parentConfig[1]].formSteps,
      ...customData,
    } as CrudDialogData;

    this.openCrudDialog(dialogData);
  }

  public updateEntity(entity: Partial<Entity>) {
    const now = Timestamp.now();

    entity = {
      ...entity,
      stats: {
        ...entity.stats!,
        updatedAt: now,
        updatedBy: this.authService.loggedUser.uid,
      }
    };

    return this.repository.editEntity$(entity);
  }

  public resetCounter(entity: Partial<Entity>,
    subcollectionPath: string,
    propertyPath: string,
    counterPath: string) {
    const now = Timestamp.now();

    entity = {
      ...entity,
      stats: {
        ...entity.stats!,
        updatedAt: now,
        updatedBy: this.authService.loggedUser.uid,
      }
    };

    return this.repository.resetCounter$(entity, subcollectionPath, propertyPath, counterPath);
  }

  public removeEntityDialog(entity: Entity, customData?: Partial<CrudDialogData>) {
    const now = Timestamp.now();

    const dialogData = {
      operation: 'delete',
      entity: {
        ...entity,
        stats: {
          ...entity.stats,
          updatedAt: now,
          updatedBy: this.authService.loggedUser.uid,
        }
      },
      title: `Remove ${this.entityConfig.displayName}`,
      steps: this.entityConfig.formSteps,
      ...customData
    } as CrudDialogData;

    this.openCrudDialog(dialogData);
  }

  public sortEntities(
    sortType: SortType,
    sortProperty: string,
    forTemplates: boolean,
  ) {
    const sortSettings = !forTemplates ?
      this.viewSettings.sort :
      this.contextSettings.sort;

    let sortUpdate: SortSettings;

    if (sortSettings.sortType !== sortType) {
      sortUpdate = {
        ...sortSettings,
        sortType,
        sortProperty,
        sortDirection: 'asc',
      };
    } else {
      if (sortSettings.sortDirection === 'asc') {
        sortUpdate = {
          ...sortSettings,
          sortType,
          sortProperty,
          sortDirection: 'desc',
        };
      } else {
        sortUpdate = {
          ...sortSettings,
          sortType: null,
        }
      };
    }

    if (!forTemplates) {
      this.viewSettings = { sort: sortUpdate };
    } else {
      this.contextSettings = { sort: sortUpdate };
    }
  }

  public openConfigSheet(sheetData: ConfigSheetData) {
    const sheetRef = this.sheet.open(
      ConfigSheetComponent,
      {
        data: sheetData
      }
    );
  }

  public onPaginatorChange(
    {
      pageIndex,
      pageSize,
      previousPageIndex,
      length: oldLimit,
    }: PageEvent,
    oldSize: number,
    queryHead?: QueryDocumentSnapshot,
    queryTail?: QueryDocumentSnapshot,
    forTemplates = false,
  ) {

    const firstPage = !pageIndex;
    const nextPage = pageIndex - previousPageIndex! === 1;
    const previousPage = !firstPage && pageIndex - previousPageIndex! === -1;
    const lastPage = pageIndex - previousPageIndex! === 2;

    let querySize: number;
    let anchorHead: boolean | undefined;

    if (oldSize < pageSize) {
      querySize = oldSize;

      if (!pageIndex) {
        anchorHead = true;
        querySize = pageSize * (pageIndex + 2) + 1;
      } else {
        anchorHead = false;
      }
    } else {
      if (lastPage) {
        anchorHead = false;
        querySize = pageSize * (pageIndex + 1);
      } else {
        if (nextPage) {

        } else if (previousPage) {
          if (!oldSize) {
            pageIndex = 0;
            anchorHead = true;
          }

        } else if (firstPage) {
          anchorHead = true;
        }

        querySize = pageSize * (pageIndex + 2) + 1;
      }
    }

    const querySettings = {
      paginator: {
        pageIndex,
        lastPageIndex: previousPageIndex,
        pageSize,
        querySize,
        queryHead,
        queryTail,
        ...(anchorHead !== undefined && {
          anchorHead
        })
      } as PaginatorSettings
    };

    if (!forTemplates) {
      this.querySettings = querySettings;
    } else {
      this.templateSettings = querySettings;
    }
  }
}
