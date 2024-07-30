import { Inject, Injectable } from "@angular/core";
import { Timestamp } from "@angular/fire/firestore";
import { combineLatest, map, Observable, switchMap } from "rxjs";
import { Router } from "@angular/router";

// ===================== MODELS =====================

import {
  EntityActionStates, SectionConfig,
  ConfigParams, InvokeActionParams
} from "src/app/styleguide";
import { StarRating, Entity } from "functions/src/styleguide/models";

// ===================== UTILITY =====================

import { environment } from "src/environments/environment";
import { getSearchString } from "src/app/styleguide/utility";

// ===================== SERVICES =====================

import { EntityRepository } from "./entity.repository";
import { EntityService } from "./entity.service";
import { SECTION_CONFIG } from "src/app/styleguide/services/app.providers";
import { AppService } from "src/app/styleguide/services/app.service";
import { AuthService } from "../../firebase/services/auth.service";
import { FunctionsService } from "../../firebase/services/functions.service";
import { ref } from "@angular/fire/storage";
import { StorageService } from "../../firebase/services/storage.service";
import { getFileName } from "functions/src/styleguide/utility/file-names";

// ===================== DEFINITIONS =====================

@Injectable()
export class EntityAdapter {

  public actionStates$: Observable<EntityActionStates> = this.getActionStates$(false);
  public templateActionStates$: Observable<EntityActionStates> = this.getActionStates$(true);

  constructor(
    @Inject(SECTION_CONFIG) protected sectionConfig: SectionConfig,
    protected entityService: EntityService,
    protected entityRepository: EntityRepository,
    protected appService: AppService,
    protected authService: AuthService,
    protected functionsService: FunctionsService,
    protected storageService: StorageService,
    protected router: Router,
  ) {
  }

  public getActionStates$(forTemplates: boolean) {
    return combineLatest([
      this.entityService.viewSettings$,
      this.entityService.querySettings$,
      this.entityService.templateSettings$,
      this.entityService.contextSettings$,
    ]).pipe(
      map(([viewSettings, querySettings, templateSettings, contextSettings]) => ({
        // collection actions
        'create-entity': () => 'default',
        'edit-entity': () => 'default',
        'edit-parent': () => 'default',
        'copy-entity': () => 'default',
        'remove-entity': ({
          entity
        }: Partial<ConfigParams>) => entity!.attributes.isArchived ? 'archived' : 'default',

        'view-media': () => 'default',
        'download-files': () => 'default',

        // view actions
        'show-archived': () => {
          const viewFilter = (!forTemplates ? querySettings : templateSettings).viewFilters['showArchived'];

          if (!viewFilter || !viewFilter.value) {
            return 'default';
          }

          return 'visible';

          // if (!viewFilter) {
          //   return 'archived-only';
          // } else {
          //   if (!!viewFilter.value) {
          //     return 'hide-archived';
          //   } else {
          //     return 'default';
          //   }
          // }
        },
        'show-seqNo': () => {
          const columnHidden = (!forTemplates ? viewSettings : contextSettings).hiddenMap['seqNo'];

          if (!!columnHidden) {
            return 'default';
          }

          return 'visible';
        },

        // sort actions
        'most-recent': () => {
          const sortSettings = (!forTemplates ? viewSettings : contextSettings).sort;
          if (sortSettings.sortType !== 'most-recent') {
            return 'default';
          } else {
            if (sortSettings.sortDirection === 'asc') {
              return 'asc';
            } else {
              return 'desc';
            }
          }
        },
        'most-relevant': () => {
          const sortSettings = (!forTemplates ? viewSettings : contextSettings).sort;
          if (sortSettings.sortType !== 'most-relevant') {
            return 'default';
          } else {
            if (sortSettings.sortDirection === 'asc') {
              return 'asc';
            } else {
              return 'desc';
            }
          }
        },
        'custom-order': () => {
          const sortSettings = (!forTemplates ? viewSettings : contextSettings).sort;
          if (sortSettings.sortType !== 'custom-order') {
            return 'default';
          } else {
            if (sortSettings.sortDirection === 'asc') {
              return 'asc';
            } else {
              return 'desc';
            }
          }
        },
        'active-first': () => {
          const sortSettings = (!forTemplates ? viewSettings : contextSettings).sort;
          if (sortSettings.sortType !== 'active-first') {
            return 'default';
          } else {
            if (sortSettings.sortDirection === 'asc') {
              return 'asc';
            } else {
              return 'desc';
            }
          }
        },
        'default-first': () => {
          const sortSettings = (!forTemplates ? viewSettings : contextSettings).sort;
          if (sortSettings.sortType !== 'default-first') {
            return 'default';
          } else {
            if (sortSettings.sortDirection === 'asc') {
              return 'asc';
            } else {
              return 'desc';
            }
          }
        },

        // document actions
        'set-rating': ({
          entity
        }: Partial<ConfigParams>) => {
          switch (entity!.attributes.rating) {
            case StarRating.star:
              return 'high';
            case StarRating.star_half:
              return 'medium';
            case StarRating.star_outline:
              return 'low';
          }
        },

        'increment-seqNo': () => 'default',
        'decrement-seqNo': () => 'default',
        'share-entity': () => 'default',
      })),
    );
  }

  public invokeAction({
    action,
    context,
    forTemplates,
    url,
    entity,
    ...params
  }: InvokeActionParams<Entity>): void {
    const {
      moduleName,
      rootType,
      rootId,
      nestedType,
      nestedId,
      queryType,
      queryId,
    } = url;

    const now = Timestamp.now();
    const uid = this.authService.loggedUser.uid;

    switch (action.id) {
      case 'create-entity': {
        const targetPath = this.entityService.getTargetPathFromUrl(url);
        this.entityService.createNewEntityDialog(
          undefined,
          {
            targetPath,
            context,
            ...params.dialogSettings,
            onRequest: (finalEntity: Entity) => {
              const requestEntity: Entity = params.dialogSettings?.onRequest?.(finalEntity) ?? finalEntity;

              return {
                ...requestEntity,
                data: {
                  ...requestEntity.data,
                  searchName: getSearchString(finalEntity.information.name),
                },
                stats: {
                  ...requestEntity.stats,
                  updatedAt: requestEntity.stats.createdAt // hide build-time only controls
                }
              }
            },
          }
        );
      } break;

      case 'edit-entity': {
        this.entityService.editEntityDialog(
          entity!,
          {
            ...params.dialogSettings,
            context,
            selectedFormIdx: 0,
            onRequest: (finalEntity) => {
              const requestEntity: Entity = params.dialogSettings?.onRequest?.(finalEntity) ?? finalEntity;

              return {
                ...requestEntity,
                data: {
                  ...requestEntity.data,
                  searchName: getSearchString(finalEntity.information.name)
                }
              }
            },
          }
        );
        break;
      }
      case 'edit-parent': {
        const {
          config,
          entityIdx,
        } = this.sectionConfig.related![queryType!];

        this.entityService.editEntityDialog(
          entity!,
          {
            config: [config, entityIdx],
            selectedFormIdx: 0,
            saveButtonText: `Save ${config.tabs[entityIdx].displayName}`,
            onRequest: (finalEntity) => {
              const requestEntity: Entity = params.dialogSettings?.onRequest?.(finalEntity) ?? finalEntity;

              return {
                ...requestEntity,
                data: {
                  ...requestEntity.data,
                  searchName: getSearchString(finalEntity.information.name)
                }
              }
            },
          }
        );

        break;
      }
      case 'copy-entity': {
        const targetPath = `${this.entityService.entityConfig.firestorePath}`;
        const targetId = this.entityRepository.getNewDocId(targetPath);

        this.entityService.createNewEntityDialog(
          {
            ...entity,
            id: targetId,
            attributes: {
              ...entity!.attributes,
              originId: entity!.id
            },
            stats: {
              ...entity!.stats,
              version: environment.version,
              createdAt: now,
              createdBy: uid,
              updatedBy: uid,
              updatedAt: null!, // used for creation-time logic
            }
          },
          {
            ...params.dialogSettings,
            context,
            selectedFormIdx: 0,
            subcollections: this.sectionConfig.children,
            hideTemplates: true,
            onRequest: (finalEntity: Entity) => {
              const requestEntity: Entity = params.dialogSettings?.onRequest?.(finalEntity) ?? finalEntity;

              return {
                ...requestEntity,
                data: {
                  ...requestEntity.data,
                  searchName: getSearchString(finalEntity.information.name),
                },
                stats: {
                  ...requestEntity.stats,
                  updatedAt: requestEntity.stats.createdAt // hide build-time only controls
                }
              }
            },
          }
        );
      } break;

      case 'remove-entity': {
        this.entityService.removeEntityDialog(
          entity!,
          {
            subcollections: this.sectionConfig.children
          }
        );
      } break;

      case 'view-media': {
        const cleanUrl = url.rawUrl.split('?')[0];

        this.router.navigate(
          [
            ...cleanUrl.split('/').slice(1),
            entity!.id,
            'media'
          ],
          {
            queryParams: {
              ...(!!url.queryType ? { [url.queryType]: url.queryId } : {})
            }
          }
        );
      } break;

      case 'download-files': {
        this.appService.loadingOn();
        const origin = url.nestedType === 'media' ?
          `images/${rootType}/${rootId}/files` :
          `images/${rootType}/${entity?.id}/files`;
        const zipFileName = getFileName(
          entity?.information?.name ??
          context?.nested?.information?.name ??
          context?.query?.information?.name ??
          context?.root?.information?.name ??
          'zippedFiles'
        );

        this.functionsService.callFunction$('downloadFiles', {
          origin,
          target: zipFileName,
        })
          .pipe(
            switchMap(({ data }) => {
              console.log(data);

              const {
                url
              } = data as { url: string };

              return this.storageService.getDownloadUrl$(`${origin}/${zipFileName}.zip`);
            }),
            map((url) => {
              const link = document.createElement("a");
              link.download = 'files.zip';
              link.href = url;
              document.body.appendChild(link);
              window.open(url, '_blank');
              document.body.removeChild(link);
              this.appService.loadingOff();
            })
          ).subscribe();
      } break;

      case 'increment-seqNo': {
        this.entityService.updateEntity({
          ...entity,
          attributes: {
            ...entity?.attributes,
            seqNo: (entity?.attributes.seqNo ?? 0) + 1
          }
        } as Entity);
      } break;

      case 'decrement-seqNo': {
        this.entityService.updateEntity({
          ...entity,
          attributes: {
            ...entity?.attributes,
            seqNo: (entity?.attributes.seqNo ?? 0) - 1
          }
        } as Entity);
      } break;

      case 'show-seqNo': {
        const columnHidden = this.entityService.viewSettings.hiddenMap['seqNo'];
        if (!columnHidden) {
          this.entityService.viewSettings = {
            hiddenMap: {
              ...this.entityService.viewSettings.hiddenMap,
              seqNo: true
            }
          }
        } else {
          const {
            seqNo,
            ...hiddenMap
          } = this.entityService.viewSettings.hiddenMap;

          this.entityService.viewSettings = {
            hiddenMap
          };
        }
      } break;

      case 'show-archived-3': {
        const querySettings = !forTemplates ?
          this.entityService.querySettings :
          this.entityService.templateSettings;

        const viewFilter = querySettings.viewFilters['showArchived'];
        const viewFilters = {
          ...querySettings.viewFilters,
          ['showArchived']: {
            name: 'showArchived',
            value: true,
            property: 'attributes.isArchived',
            equality: true,
          }
        };

        if (!viewFilter) {
          if (!forTemplates) {
            this.entityService.querySettings = {
              viewFilters
            };
          } else {
            this.entityService.templateSettings = {
              viewFilters
            };
          }
        } else {
          if (!!viewFilter.value) {
            const viewFilters = {
              ...querySettings.viewFilters,
              ['showArchived']: {
                name: 'showArchived',
                value: false,
                property: 'attributes.isArchived',
                equality: true,
              }
            };

            if (!forTemplates) {
              this.entityService.querySettings = {
                viewFilters
              };
            } else {
              this.entityService.templateSettings = {
                viewFilters
              };
            }
          } else {
            const {
              showArchived,
              ...viewFilters
            } = querySettings.viewFilters;

            if (!forTemplates) {
              this.entityService.querySettings = {
                viewFilters
              };
            } else {
              this.entityService.templateSettings = {
                viewFilters
              };
            }
          }
        }
        break;
      }
      case 'show-archived': {
        const querySettings = !forTemplates ?
          this.entityService.querySettings :
          this.entityService.templateSettings;


        const viewFilter = querySettings.viewFilters['showArchived'];

        if (!viewFilter?.value) {
          const viewFilters = {
            ...querySettings.viewFilters,
            ['showArchived']: {
              name: 'showArchived',
              value: true,
              property: 'attributes.isArchived',
              equality: true,
            }
          };

          if (!forTemplates) {
            this.entityService.querySettings = {
              viewFilters
            };
          } else {
            this.entityService.templateSettings = {
              viewFilters
            };
          }
        } else {
          const viewFilters = {
            ...querySettings.viewFilters,
            ['showArchived']: {
              name: 'showArchived',
              value: false,
              property: 'attributes.isArchived',
              equality: true,
            }
          };

          if (!forTemplates) {
            this.entityService.querySettings = {
              viewFilters
            };
          } else {
            this.entityService.templateSettings = {
              viewFilters
            };
          }
        }
        break;
      }
      case 'most-recent': {
        this.entityService.sortEntities(
          'most-recent',
          'stats.updatedAt',
          forTemplates
        );
        break;
      }
      case 'custom-order': {
        this.entityService.sortEntities(
          'custom-order',
          'attributes.seqNo',
          forTemplates
        );
        break;
      }
      case 'active-first': {
        this.entityService.sortEntities(
          'active-first',
          'attributes.isActive',
          forTemplates
        );
        break;
      }
      case 'default-first': {
        this.entityService.sortEntities(
          'default-first',
          'attributes.isDefault',
          forTemplates
        );
        break;
      }
      case 'most-relevant': {
        this.entityService.sortEntities(
          'most-relevant',
          'attributes.rating',
          forTemplates
        );
        break;
      }
      case 'set-rating': {
        switch (entity!.attributes.rating) {
          case StarRating.star_outline:
            this.entityService.updateEntity({
              ...entity,
              attributes: {
                ...entity!.attributes,
                rating: StarRating.star_half
              }
            } as Entity)
            break;
          case StarRating.star_half:
            this.entityService.updateEntity({
              ...entity,
              attributes: {
                ...entity!.attributes,
                rating: StarRating.star
              }
            } as Entity)
            break;
          case StarRating.star:
            this.entityService.updateEntity({
              ...entity,
              attributes: {
                ...entity!.attributes,
                rating: StarRating.star_outline
              }
            } as Entity)
            break;
          default:
            throw new Error(`Unknown value for rating: ${entity!.attributes.rating}`);
        }
        break;
      }
      case 'share-entity':
        throw new Error(`Not implemented: ${action.id}`);
      default:
        throw new Error(`Unknown action for entity: ${action.id}`);
    }
  }
}
