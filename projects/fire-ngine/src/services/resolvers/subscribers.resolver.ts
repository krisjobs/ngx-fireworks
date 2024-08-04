import { Inject, Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from "@angular/router";
import { combineLatest, map, Observable, switchMap, tap } from "rxjs";

// ===================== MODELS =====================

import { Entity } from "functions/src/styleguide/models";
import { QuerySettings, SectionConfig } from "src/app/styleguide";

// ===================== UTILITY =====================

import { getParamsFromUrl } from "src/app/styleguide/utility";

// ===================== SERVICES =====================

import { SECTION_CONFIG } from "src/app/styleguide/services/app.providers";
import { AppService } from "src/app/styleguide/services/app.service";
import { NotificationService } from "src/app/styleguide/services/notification.service";
import { AuthService } from "../../firebase/services/auth.service";
import { EntityRepository } from "../../library/services/entity.repository";
import { EntityService } from "../../library/services/entity.service";

// ===================== DEFINITIONS =====================

@Injectable()
export class SubscribersResolver implements Resolve<Promise<Observable<Entity[]>>> {

  constructor(
    @Inject(SECTION_CONFIG) private sectionConfig: SectionConfig,
    private appService: AppService,
    private entityService: EntityService,
    private entityRepository: EntityRepository,
    protected authService: AuthService,
    protected notificationService: NotificationService,
  ) {
  }

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<Observable<Entity[]>> {
    // TODO WHY THIS ERROR HERE
    if (!this.authService.currentUser) {
      const message = 'You are not authorozied for this operation.';
      this.notificationService.error(message);
      console.error(message); // TODO extract to method in service
      throw new Error(message);
    }

    const url = state.url;

    const urlParams = getParamsFromUrl(url);

    this.entityService.querySettings = {
      sectionFilters: this.sectionConfig.sectionFilters ?? [],
    };

    return new Promise((resolve, reject) => {
      this.appService.loadingOn();

      resolve(
        combineLatest([
          this.entityService.querySettings$,
          this.entityService.entityConfig$,
          this.authService.userRoles$$.pipe(
          )
        ]).pipe(
          // tap(console.warn),
          switchMap(
            ([settings, config, roles]) => {
              const finalSettings: QuerySettings = {
                ...settings,
                viewFilters: {
                  ...settings.viewFilters,
                  ...(this.entityService.entityConfig.finalFilters?.({
                    url: urlParams
                  }) ?? {})
                }
              };

              return this.entityRepository.getUserEntities$$(
                'users',
                finalSettings
              ).pipe(
                switchMap(
                  (entities) => this.entityService.viewSettings$.pipe(
                    map(settings => this.entityRepository.sortEntities(entities, settings.sort)),
                    tap(() => this.appService.loadingOff())
                  )
                ),
              );
            }
          )
        ))
    });
  }
}
