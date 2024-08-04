import { Inject, Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from "@angular/router";
import { combineLatest, map, Observable, switchMap, tap } from "rxjs";

// ===================== MODELS =====================

import { QuerySettings, SectionConfig } from "src/app/styleguide";
import { Entity } from "functions/src/styleguide/models";

// ===================== UTILITY =====================

import { getParamsFromUrl } from "src/app/styleguide/utility";

// ===================== SERVICES =====================

import { SECTION_CONFIG } from "src/app/styleguide/services/app.providers";
import { AppService } from "src/app/styleguide/services/app.service";
import { AuthService } from "../../firebase/services/auth.service";
import { EntityRepository } from "../data/repository.service";
import { EntityService } from "../data/entity.service";

// ===================== DEFINITIONS =====================

@Injectable()
export class EntitiesResolver implements Resolve<Promise<Observable<Entity[]>>> {

  constructor(
    @Inject(SECTION_CONFIG) private sectionConfig: SectionConfig,
    private appService: AppService,
    private entityService: EntityService,
    private entityRepository: EntityRepository,
    private authService: AuthService,
  ) {
  }

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<Observable<Entity[]>> {

    const url = state.url;

    const urlParams = getParamsFromUrl(url)
    const {
      rootType,
      rootId,
      queryId,
      queryType
    } = urlParams;

    this.entityService.querySettings = {
      sectionFilters: this.sectionConfig.sectionFilters ?? [],
      tabFilters: this.entityService.entityConfig.tabFilters ?? []
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
              const targetPath = !config.bypassTargetPath ?
                this.entityService.getTargetPathFromUrl(urlParams) :
                config.firestorePath;
              const finalSettings: QuerySettings = {
                ...settings,
                viewFilters: {
                  ...settings.viewFilters,
                  ...(this.entityService.entityConfig.finalFilters?.({ url: urlParams }) ?? {})
                }
              };

              const entitiesObs$$ = !!roles.admin || !!config.getGlobalData ?
                this.entityRepository.getEntities$$(
                  targetPath,
                  finalSettings
                ) :
                this.entityRepository.getUserEntities$$(
                  targetPath,
                  finalSettings
                );

              return entitiesObs$$.pipe(
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
