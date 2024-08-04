import { HttpClient } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { Router } from "@angular/router";
import { combineLatest, map, switchMap } from "rxjs";

// ===================== MODELS =====================

import { User, FileType, LinkType, EntityFile, EntityLink } from "functions/src/styleguide/models";
import {
  InvokeActionParams, EntityActionStates, QuerySettings,
  SectionConfig, ViewSettings
} from "src/app/styleguide";

// ===================== SERVICES =====================

import { EntityRepository } from "src/app/styleguide/modules/library/services/entity.repository";
import { EntityAdapter } from "src/app/styleguide/modules/library/services/entity.adapter";
import { SECTION_CONFIG } from "src/app/styleguide/services/app.providers";
import { EntityService } from "src/app/styleguide/modules/library/services/entity.service";
import { NotificationService } from "src/app/styleguide/services/notification.service";
import { AuthService } from "src/app/styleguide/modules/firebase/services/auth.service";
import { AppService } from "src/app/styleguide/services/app.service";
import { FileService } from "../../common/sync/legacy/media/services/file.service";
import { StorageService } from "../../firebase/services/storage.service";
import { FilesRepository } from "../../common/sync/legacy/media/services/files.repository";
import { FunctionsService } from "../../firebase/services/functions.service";
import { getFileType, getLinkType } from "src/app/styleguide/utility/media.util";
import { MediaEntity } from "functions/src/styleguide/models/library/media.models";

// ===================== DEFINITIONS =====================

@Injectable()
export class MediaAdapter extends EntityAdapter {

  constructor(
    @Inject(SECTION_CONFIG) protected override sectionConfig: SectionConfig,
    protected override entityService: EntityService,
    protected override entityRepository: EntityRepository,
    protected override appService: AppService,
    protected override authService: AuthService,
    protected override functionsService: FunctionsService,
    protected override storageService: StorageService,
    protected override router: Router,
    private notificationService: NotificationService,
    private httpClient: HttpClient,
    private fileService: FileService,
    private filesRepository: FilesRepository,
  ) {
    super(
      sectionConfig,
      entityService,
      entityRepository,
      appService,
      authService,
      functionsService,
      storageService,
      router,
    );
  }

  public override getActionStates$(forTemplates = false) {
    return combineLatest([
      this.entityService.viewSettings$,
      this.entityService.querySettings$,
    ])
      .pipe(
        switchMap(settings => {
          return this.authService.currentUser$$.pipe(
            switchMap(user => this.entityRepository.getEntity$$(
              user!.uid,
              'users'
            )),
            map((user) => [...settings, user] as [ViewSettings, QuerySettings, User])
          )
        }),
        map(([viewSettings, querySettings, currentUser]) => ({
          // collection actions

          // view actions

          // document actions
          'download-file': () => 'default',
          'set-thumbnail': () => 'default',
          'bulk-add': () => 'default',
          'open-link': () => 'default',

        } as EntityActionStates)),
        switchMap(actions => super.getActionStates$(forTemplates).pipe(
          map(entityActions => ({
            ...actions,
            ...entityActions
          })),
        ))
      );
  }

  public override invokeAction(params: InvokeActionParams<MediaEntity>): void {
    const {
      action,
      url,
      entity,
      context,
      forTemplates,
    } = params;

    const {
      moduleName,
      rootType,
      rootId,
      nestedType,
      nestedId,
      queryType,
      queryId,
    } = url;

    const media = entity as MediaEntity;

    switch (action.id) {
      // collection actions
      case 'create-entity': {
        super.invokeAction({
          ...params,

          dialogSettings: {
            ...params.dialogSettings,
            url: params.url,
            onRequest: (media: MediaEntity) => {
              const mediaType = this.entityService.entityConfig.descriptor;

              let mediaClass: FileType | LinkType;

              switch (mediaType) {
                case 'file': {
                  mediaClass = getFileType(media as EntityFile);
                  media = media as EntityFile;
                  break;
                }
                case 'link': {
                  mediaClass = getLinkType(media as EntityLink);
                  break;
                }
                default: {
                  throw new Error(`Unknown media type: ${mediaType}`);
                }
              }

              return {
                ...media,
                attributes: {
                  ...media.attributes,
                  type: this.entityService.entityConfig.descriptor,
                  class: mediaClass
                },
                data: {
                  ...media.data,
                  uploaderName: this.authService.currentUser?.displayName
                },
                media: {
                  defaultUrl: mediaType === 'file' ?
                    mediaClass === FileType.Image ?
                      (media as EntityFile).information.fileUrl :
                      (mediaClass === FileType.Excel ?
                        'https://upload.wikimedia.org/wikipedia/commons/thumb/3/34/Microsoft_Office_Excel_%282019%E2%80%93present%29.svg/640px-Microsoft_Office_Excel_%282019%E2%80%93present%29.svg.png' :
                        (mediaClass === FileType.Word ?
                          'https://upload.wikimedia.org/wikipedia/commons/thumb/f/fd/Microsoft_Office_Word_%282019%E2%80%93present%29.svg/640px-Microsoft_Office_Word_%282019%E2%80%93present%29.svg.png' :
                          (mediaClass === FileType.PDF ?
                            'https://upload.wikimedia.org/wikipedia/commons/thumb/8/87/PDF_file_icon.svg/640px-PDF_file_icon.svg.png' :
                            'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Generic_File_OneDrive_icon.svg/640px-Generic_File_OneDrive_icon.svg.png'
                          )
                        )
                      ) :
                    mediaClass === LinkType.YouTube ?
                      'https://upload.wikimedia.org/wikipedia/commons/thumb/5/52/YouTube_social_white_circle_%282017%29.svg/640px-YouTube_social_white_circle_%282017%29.svg.png' :
                      'https://upload.wikimedia.org/wikipedia/commons/5/56/Chain_link_icon_slanted.png'
                }
              } as MediaEntity
            }
          }
        })

      } break;
      // view actions

      // document actions
      case 'download-file': {
        const file = media as EntityFile;
        const browserLink = document.createElement("a");
        browserLink.download = file.information.name;
        browserLink.href = file.information.fileUrl;
        document.body.appendChild(browserLink);
        window.open(file.information.fileUrl, '_blank');
        document.body.removeChild(browserLink);
      } break;

      case 'set-thumbnail': {
        const file = media as EntityFile;

        this.entityService.updateEntity({
          ...(context?.nested ?? context?.root),
          'media.defaultUrl': file.information.fileUrl
        } as any)
      } break;

      case 'bulk-add': {
        this.filesRepository.bulkAddFiles$(url)
      } break;

      case 'open-link': {
        const {
          information: {
            linkUrl: defaultUrl
          }
        } = media as EntityLink;

        if (!!defaultUrl) {
          window.open(defaultUrl, '_blank');
        }

        break;
      }

      default:
        super.invokeAction(params);
    }
  }
}
