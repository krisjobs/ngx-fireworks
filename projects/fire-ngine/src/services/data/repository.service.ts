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
}
