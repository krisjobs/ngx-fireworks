import { Inject, Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { BehaviorSubject, combineLatest, filter, from, map, NEVER, Observable, of, switchMap, tap } from 'rxjs';

// ===================== MODELS =====================

import {
  Entity, StarRating
} from 'functions/src/styleguide/models';

import {
  SortType, PaginatorSettings, SectionConfig, ModalData,
  ViewSettings, QuerySettings, EntityAction, EntityConfig,
  PanelData, SortSettings, UrlParams
} from 'src/app/styleguide';

// ===================== UTILITY =====================

import { environment } from 'src/environments/environment';

import { getParamsFromUrl } from 'src/app/styleguide/utility';

// ===================== SERVICES =====================

import { SECTION_CONFIG } from 'src/app/styleguide/services/app.providers';
import { NotificationService } from 'src/app/styleguide/services/notification.service';
import { EntityRepository } from './repository.service';
import { UserService } from '../../users/services/user.service';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { AppService } from 'src/app/styleguide/services/app.service';
import { AuthService } from '../../firebase/services/auth.service';

// ===================== COMPONENTS =====================

import { PanelComponent } from '../components/organisms/config-sheet/config-sheet.component';
import { ModalComponent } from '../components/organisms/crud-dialog/crud-dialog.component';

// ===================== DEFINITIONS =====================

/**
 * * if you can import EntityService <=> you have access to entityConfig
 */
@Injectable()
export class EntityService {




  public get entityConfig(): EntityConfig {
    return this.sectionConfig.tabs[this.activeTabIdx];
  }

  public entityConfig$: Observable<EntityConfig> = this.activeTabIdx$.pipe(
    map(idx => this.sectionConfig.tabs[idx])
  );

  public get templateConfig(): EntityConfig | undefined {
    return this.sectionConfig.templates?.[this.activeFormIdx];
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





  public generateRawEntity(parent?: Entity, sectionAsType = false): Partial<Entity> {
    const now = EntityTimestamp.now();

    if (!this.authService.currentUser) {
      const message = 'You are not authorozied for this operation';
      this.notificationService.error(message);
      throw new Error(message);
    }

    // const reminderDate = new Date();
    // reminderDate.setFullYear(nowDate.getFullYear() + 1);
    // const reminder = EntityTimestamp.fromDate(reminderDate);

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

  public createNewEntityDialog(entity?: Partial<Entity>, customData?: Partial<ModalData>) {
    const parentConfig = customData?.config;
    const newEntity = this.generateRawEntity(customData?.context?.query!, !!customData?.sectionAsType);

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
    } as ModalData;

    this.openCrudDialog(dialogData);
  }

  public editEntityDialog(entity: Entity, customData?: Partial<ModalData>) {
    const now = EntityTimestamp.now();

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
    } as ModalData;

    this.openCrudDialog(dialogData);
  }

  public updateEntity(entity: Partial<Entity>) {
    const now = EntityTimestamp.now();

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
    const now = EntityTimestamp.now();

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

  public removeEntityDialog(entity: Entity, customData?: Partial<ModalData>) {
    const now = EntityTimestamp.now();

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
    } as ModalData;

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

  public sortEntities(entities: Entity[], settings: SortSettings): Entity[] {
    const {
      sortType,
      sortDirection,
      sortProperty,
      tableSortProperty,
      tableSortDirection,
    } = settings;

    if (!sortType && !tableSortProperty) {
      return entities;
    } else if (!!sortType && !!tableSortProperty) {
      const tableSort = (e1: Entity, e2: Entity) => {
        if (tableSortDirection === 'asc') {
          if (eval(`e1.${tableSortProperty}`) > eval(`e2.${tableSortProperty}`)) {
            return 1;
          } else if (eval(`e1.${tableSortProperty}`) < eval(`e2.${tableSortProperty}`)) {
            return -1;
          }
        } else {
          if (eval(`e1.${tableSortProperty}`) > eval(`e2.${tableSortProperty}`)) {
            return -1;
          } else if (eval(`e1.${tableSortProperty}`) < eval(`e2.${tableSortProperty}`)) {
            return 1;
          }
        }

        return 0;
      }

      return [...entities].sort(
        (e1, e2) => {

          if (sortDirection === 'asc') {
            if (eval(`e1.${sortProperty}`) > eval(`e2.${sortProperty}`)) {
              return 1;
            } else if (eval(`e1.${sortProperty}`) < eval(`e2.${sortProperty}`)) {
              return -1;
            } else {
              return tableSort(e1, e2);
            }
          } else {
            if (eval(`e1.${sortProperty}`) > eval(`e2.${sortProperty}`)) {
              return -1;
            } else if (eval(`e1.${sortProperty}`) < eval(`e2.${sortProperty}`)) {
              return 1;
            } else {
              return tableSort(e1, e2);
            }
          }
        }
      );
    } else {
      const property = !!sortType ? sortProperty : tableSortProperty;
      const direction = !!sortType ? sortDirection : tableSortDirection;

      return [...entities].sort(
        (e1, e2) => {
          if (direction === 'asc') {
            if (eval(`e1.${property}`) > eval(`e2.${property}`)) {
              return 1;
            } else if (eval(`e1.${property}`) < eval(`e2.${property}`)) {
              return -1;
            }
          } else {
            if (eval(`e1.${property}`) > eval(`e2.${property}`)) {
              return -1;
            } else if (eval(`e1.${property}`) < eval(`e2.${property}`)) {
              return 1;
            }
          }

          return 0;
        }
      )
    }
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

  // TODO finish implementation
  /**
   * example
        // this.entityService.resetCounter(yacht!, 'equipment', 'attributes.isActive', 'data.retailConfigurationPrice')
   *
   */
  public resetCounter$(
    parent: Partial<Entity>,
    subcollectionPath: string,
    propertyPath: string,
    counterPath: string,
  ) {

    const targetPath = `${parent.path}/${subcollectionPath}`;

    const now = EntityTimestamp.now();

    return this.firestoreService.getDocs$(targetPath).pipe(
      map((docs) => docs as Entity[]),
      switchMap(entities => {

        eval(`parent.${counterPath} = 0`);

        return this.firestoreService.batchWrite$({
          update: entities
            .map(
              entity => {
                eval(`entity.${propertyPath} = false`);
                console.warn(targetPath, entity.id)
                return [
                  {
                    ...entity,
                    attributes: {
                      ...entity.attributes,
                    },
                    stats: {
                      ...entity.stats,
                      updatedAt: now,
                      updatedBy: this.authService.loggedUser.uid,
                    }
                  } as Entity,
                  this.firestoreService.getDocRef(targetPath, entity.id)
                ]
              }
            ).concat([
              {
                ...parent
              } as Entity,
              this.firestoreService.getDocRef(parent.path!, parent.id!)
            ]) as any
        })
      })
    );
  }
}
