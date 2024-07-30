import { Inject, Injectable } from '@angular/core';
import {
  documentId, DocumentReference, endBefore,
  limit, limitToLast, orderBy, QueryConstraint, startAfter,
  Timestamp, where
} from '@angular/fire/firestore';
import { forkJoin, Observable } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';

// ===================== MODELS =====================

import {
  SectionConfig, QuerySettings, SortSettings,
  ConfigParams,
} from 'src/app/styleguide';
import { Entity, EntityAttributes } from 'functions/src/styleguide/models';

// ===================== UTILITY =====================

// ===================== SERVICES =====================

import { SECTION_CONFIG } from 'src/app/styleguide/services/app.providers';
import { FirestoreService } from 'src/app/styleguide/modules/firebase/services/firestore.service';
import { AuthService } from '../../firebase/services/auth.service';
import { NotificationService } from 'src/app/styleguide/services/notification.service';
import { AppService } from 'src/app/styleguide/services/app.service';

// ===================== DEFINITIONS =====================

@Injectable()
export class EntityRepository {

  constructor(
    @Inject(SECTION_CONFIG) protected sectionConfig: SectionConfig,
    protected firestoreService: FirestoreService,
    protected authService: AuthService,
    protected notificationService: NotificationService,
    protected appService: AppService,
  ) { }

  protected querySettings2Constraints(settings?: QuerySettings): QueryConstraint[] {
    if (!settings) {
      return [];
    }

    let {
      paginator: {
        pageSize,
        pageIndex,
        lastPageIndex,
        queryHead,
        queryTail,
        anchorHead,
      },

      filters,
      tabFilters,
      sectionFilters,
      viewFilters,
    } = settings;

    filters = filters.concat(tabFilters, sectionFilters, Object.values(viewFilters));
    // console.warn('FILTERS ->>>', viewFilters, Object.values(viewFilters))

    const firstPage = !pageIndex;
    const nextPage = pageIndex - lastPageIndex! === 1;
    const previousPage = !firstPage && pageIndex - lastPageIndex! === -1;
    const lastPage = pageIndex - lastPageIndex! === 2;

    let constraints: QueryConstraint[] = [];

    for (let filter of filters.filter(
      f => f.equality === false && (f.value !== null || f.range !== null)
    )) {
      let {
        value,
        range,
      } = filter;

      if (!!value) {
        // 1. string inequality filters
        value = value as string;
        const nextLetter = String.fromCharCode(value.charCodeAt(value.length - 1) + 1);
        const nextWord = `${value.slice(0, -1)}${nextLetter}`;
        constraints.push(orderBy(filter.property, 'asc'));
        constraints.push(where(filter.property, '>=', value));
        constraints.push(where(filter.property, '<', nextWord));
      } else if (!!range) {
        // 1.5 number inequality filters
        const {
          min,
          max,
          exclusive
        } = range;

        const gtOp = !exclusive ? '>=' : '>';
        const ltOp = !exclusive ? '<=' : '<';

        constraints.push(orderBy(filter.property, 'asc'));

        if (min) {
          constraints.push(where(filter.property, gtOp, min));
        }

        if (max) {
          constraints.push(where(filter.property, ltOp, max));
        }
      }
    }

    // 2. equality filters
    for (let filter of filters.filter(
      f => (f.equality === true || f.equality === undefined) && f.value !== null
    )) {
      constraints.push(where(filter.property, '==', filter.value));
    }

    // 3. array operation filters
    for (let filter of filters.filter(
      f => f.equality === 'array' && f.value !== null
    )) {
      constraints.push(where(filter.property, 'array-contains', filter.value));
    }

    // 3.5 in operation filters
    for (let filter of filters.filter(
      f => f.equality === 'in' && f.value !== null
    )) {
      constraints.push(orderBy(documentId(), 'desc'));
      constraints.push(where(
        filter.property === 'id' ? documentId() : filter.property,
        'in',
        filter.value)
      );
    }

    // 4. default orderBy in any case
    if (!filters.find(filter => filter.property === 'id')) {
      constraints.push(orderBy(settings.defaultOrderByField ?? 'stats.createdAt', 'desc'));
    }

    // 5. startAt/endAt and the like
    if (lastPage) {
      constraints.push(limitToLast(pageSize));
    } else {
      if (nextPage) {
        // next page
        if (queryTail) {
          constraints.push(startAfter(queryTail));
        }
      } else if (previousPage) {
        // previous page
        if (queryHead) {
          constraints.push(endBefore(queryHead));
        }
      } else if (firstPage) {

      }

      if (anchorHead) {
        constraints.push(limit(pageSize));
      } else {
        constraints.push(limitToLast(pageSize));
      }
    }

    console.warn(constraints)

    return constraints;
  }

  // TODO finish implementation
  public resetCounter$(
    parent: Partial<Entity>,
    subcollectionPath: string,
    propertyPath: string,
    counterPath: string,
  ) {

    const targetPath = `${parent.path}/${subcollectionPath}`;

    const now = Timestamp.now();

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

  private copySubcollection$(
    docRef: DocumentReference,
    subcollectionPath: string,
    parentPath: string,
    data: Entity,
    copyAttributes: (params: Partial<ConfigParams>) => EntityAttributes
  ) {

    const sourcePath = `${parentPath}/${subcollectionPath}`;
    const targetPath = `${docRef.path}/${subcollectionPath}`;

    const now = Timestamp.now();

    return this.firestoreService.getDocs$(sourcePath).pipe(
      map((docs) => docs as Entity[]),
      switchMap(entities => {

        return this.firestoreService.batchWrite$({
          set: entities.map(
            entity => [
              {
                ...entity,
                attributes: {
                  ...entity.attributes,
                  ...copyAttributes({
                    entity,
                    data
                  })
                },
                stats: {
                  ...entity.stats,
                  createdAt: now,
                  createdBy: this.authService.currentUser!.uid,
                  updatedAt: now,
                  updatedBy: this.authService.loggedUser.uid,
                }
              },
              this.firestoreService.newDocRef(targetPath)
            ]
          )
        })
      })
    );
  }

  private deleteSubcollection$(
    subcollectionPath: string,
    parentPath: string
  ) {

    const targetPath = `${parentPath}/${subcollectionPath}`;

    return this.firestoreService.getDocs$(targetPath).pipe(
      map((docs) => docs as Entity[]),
      switchMap(entities => {

        return this.firestoreService.batchWrite$({
          delete: entities.map(
            entity => [
              entity,
              this.firestoreService.getDocRef(targetPath, entity.id)
            ]
          )
        })
      })
    );
  }

  public getNewDocId(collection: string) {
    return this.firestoreService.newDocRef(collection).id;
  }

  // ===================== CRUD =====================

  public createEntity$(
    {
      id: copyId,
      path: copyPath,
      ...newEntity
    }: Partial<Entity>,
    firestorePath: string, // of current entity config
    newId?: string,
    targetPath: string = '', // even number of segments
    copySubcollections: string[] = [],
    copySubcollectionAttributes: (params: Partial<ConfigParams>) => EntityAttributes =
      ({ entity }) => entity!.attributes
  ) {
    if (!this.authService.currentUser) {
      const message = 'You are not authorozied for this operation';
      this.notificationService.error(message);
      throw new Error(message);
    }

    const newPath = targetPath || copyPath || firestorePath;

    newEntity = {
      ...newEntity,
      stats: {
        ...newEntity.stats,
        updatedAt: new Timestamp(newEntity.stats?.createdAt?.seconds!, newEntity.stats?.createdAt?.nanoseconds!),
        createdAt: new Timestamp(newEntity.stats?.createdAt?.seconds!, newEntity.stats?.createdAt?.nanoseconds!),
        createdBy: this.authService.loggedUser.uid,
        updatedBy: this.authService.loggedUser.uid,
      }
    } as Partial<Entity>;

    let createEntity$: Observable<Partial<Entity>>;

    if (!!copySubcollections.length) {
      const docRef = this.firestoreService.getDocRef(newPath, newId!);

      const parentPath = `${copyPath}/${newEntity.attributes?.originId}`;

      createEntity$ = forkJoin([
        ...copySubcollections.map(
          entityPath => this.copySubcollection$(docRef, entityPath, parentPath, newEntity as Entity, copySubcollectionAttributes)
        )
      ]).pipe(
        switchMap(() => this.firestoreService.setDoc$(docRef, newEntity)),
        map((newEntity) => {
          return newEntity;
        })
      )
    } else {
      if (!!newId) {
        const docRef = this.firestoreService.getDocRef(newPath, newId);

        createEntity$ = this.firestoreService.setDoc$(docRef, newEntity);

      } else {
        createEntity$ = this.firestoreService.addDoc$(newPath, newEntity);
      }
    }

    return createEntity$.pipe(
      map((data) => ({
        ...data,
        path: newPath,
      }) as Entity),
    );
  }

  public getEntity$(
    entityId: string,
    path: string, // collection
  ): Observable<Entity> {

    let getEntity$ = this.firestoreService.getDoc$<Entity>(path, entityId);

    return getEntity$.pipe(
    );
  }

  public getEntity$$(
    entityId: string,
    path: string, // collection
  ): Observable<Entity> {
    let getEntity$$ = this.firestoreService.getDoc$$<Entity>(path, entityId);

    return getEntity$$.pipe(
    );
  }

  public getEntities$(
    path: string, // collection
    settings?: QuerySettings,
  ): Observable<Entity[]> {
    let getEntities$ = this.firestoreService.getDocs$(
      path,
      ...this.querySettings2Constraints(settings)
    );

    return getEntities$.pipe(
      map(snaps => snaps as Entity[]),
    );
  }

  public getEntities$$(
    path: string, // collection
    settings: QuerySettings,
  ): Observable<Entity[]> {
    let getEntities$$ = this.firestoreService.getDocs$$(
      path,
      ...this.querySettings2Constraints(settings)
    );

    return getEntities$$.pipe(
      map(snaps => snaps as Entity[]),
    );
  }

  public getUserEntities$(
    path: string, // collection
    querySettings: QuerySettings,
  ): Observable<Entity[]> {
    if (!this.authService.currentUser) {
      const message = 'You are not authorozied for this operation.';
      this.notificationService.error(message);
      console.error(message); // TODO extract to method in service
      throw new Error(message);
    }

    return this.getEntities$(
      `${path}`,
      {
        ...querySettings,
        filters: [
          ...querySettings.filters,
          {
            name: 'isSubscribed',
            property: 'data.subscribers',
            value: this.authService.currentUser.uid,
            equality: 'array'
          }
        ]
      }
    );
  }

  public getUserEntities$$(
    path: string, // collection
    querySettings: QuerySettings,
  ): Observable<Entity[]> {
    if (!this.authService.currentUser) {
      const message = 'You are not authorozied for this operation.';
      this.notificationService.error(message);
      console.error(message); // TODO extract to method in service
      throw new Error(message);
    }

    return this.getEntities$$(
      `${path}`,
      {
        ...querySettings,
        filters: [
          ...querySettings.filters,
          {
            name: 'isSubscribed',
            property: 'data.subscribers',
            value: this.authService.currentUser.uid,
            equality: 'array'
          }
        ]
      }
    ).pipe(
      // switchMap(entities => this.firestoreService.runTransaction$(() => {

      // }) as Observable<Entity[]>)
    );
  }

  public editEntity$(
    {
      ...updatedEntity
    }: Partial<Entity>,
  ): Observable<Partial<Entity>> {
    let editEntity$ = this.firestoreService.updateDoc$(
      updatedEntity.path!,
      {
        ...updatedEntity
      } as Entity
    );

    return editEntity$.pipe(
      map(() => ({
        ...updatedEntity
      })),
    );
  }

  public removeEntity$(
    removedEntity: Entity,
    markedForDelete = false,
    deleteSubcollections: string[] = []
  ): Observable<string> {
    let removeEntity$: Observable<any>;

    const {
      id: removeId,
      path: removePath,
    } = removedEntity;

    const now = Timestamp.now();

    if (!markedForDelete) {
      removeEntity$ = this.firestoreService.updateDoc$(
        removePath,
        {
          ...removedEntity,
          attributes: {
            ...removedEntity.attributes,
            isArchived: !removedEntity.attributes.isArchived,
          },
          stats: {
            ...removedEntity.stats,
            updatedAt: now,
            updatedBy: this.authService.loggedUser.uid,
          }
        }
      );
    } else {
      const parentPath = `${removePath}/${removeId}`;

      removeEntity$ = forkJoin([
        this.firestoreService.deleteDoc$(removePath, removedEntity),
        ...deleteSubcollections.map(
          entityPath => this.deleteSubcollection$(entityPath, parentPath)
        )
      ]);
    }

    return removeEntity$.pipe(
      map(() => (removeId)),
    );
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
}
