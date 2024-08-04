import { Inject, Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, Resolve, RouterStateSnapshot } from "@angular/router";
import { map, Observable, switchMap, tap } from "rxjs";

// ===================== MODELS =====================

import { Entity } from "functions/src/styleguide/models";

// ===================== SERVICES =====================

import { SECTION_CONFIG } from "src/app/styleguide/services/app.providers";
import { AppService } from "src/app/styleguide/services/app.service";
import { SectionConfig } from "src/app/styleguide";
import { EntityRepository } from "../../library/services/entity.repository";
import { EntityService } from "../../library/services/entity.service";

// ===================== DEFINITIONS =====================

@Injectable()
export class UsersResolver implements Resolve<Promise<Observable<Entity[]>>> {

  constructor(
    @Inject(SECTION_CONFIG) private sectionConfig: SectionConfig,
    private appService: AppService,
    private entityService: EntityService,
    private entityRepository: EntityRepository,
  ) {
  }

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<Observable<Entity[]>> {

    // const url = state.url;

    const targetPath = 'users';

    this.entityService.querySettings = {
      sectionFilters: this.sectionConfig.sectionFilters ?? []
    };

    return new Promise((resolve, reject) => {
      this.appService.loadingOn();

      resolve(
        this.entityService.querySettings$.pipe(
          switchMap(
            settings => {
              return this.entityRepository.getEntities$$(
                targetPath,
                settings
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
