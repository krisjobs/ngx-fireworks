import { Inject, Injectable } from "@angular/core";
import { Observable, tap } from "rxjs";
import { ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";

// ===================== MODELS =====================


import { SectionConfig, UrlEntitiesContext } from "src/app/styleguide";
import { Entity } from "functions/src/styleguide/models";

// ===================== UTILITY =====================

import { getParamsFromUrl } from "src/app/styleguide/utility";

// ===================== SERVICES =====================

import { SECTION_CONFIG } from "src/app/styleguide/services/app.providers";
import { EntityRepository } from "../data/repository.service";
import { EntityService } from "../data/entity.service";
import { AppService } from "src/app/styleguide/services/app.service";
import { NotificationService } from "src/app/styleguide/services/notification.service";

// ===================== DEFINITIONS =====================

@Injectable()
export class EntityResolver {

  constructor(
    @Inject(SECTION_CONFIG) private sectionConfig: SectionConfig,
    private appService: AppService,
    private entityService: EntityService,
    private entityRepository: EntityRepository,
    private notificationService: NotificationService,
  ) { }

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<UrlEntitiesContext> {
    const url = state.url;

    const urlParams = getParamsFromUrl(url);
    const {
      moduleName,
      rootType,
      rootId,
      nestedType,
      nestedId,
      queryType,
      queryId
    } = urlParams;

    let rootEntity$$: Observable<Entity>;
    let nestedEntity$$: Observable<Entity>;
    let queryEntity$$: Observable<Entity>;

    if (!!rootType && !!rootId) {
      if (!this.sectionConfig.related || !(rootType in this.sectionConfig.related)) {
        // TODO think of a better way to display this message when entityId is placeholder
        const message = `LIB: add ${rootType} to ${this.entityService.entityConfig.entityId}(${this.entityService.entityConfig.displayName}).sectionConfig.related`
        this.notificationService.error(message);
        throw new Error(message);
      }

      const {
        config,
        entityIdx,
        firestorePathOverride,
      } = this.sectionConfig.related[rootType];

      const targetPath = `${config.tabs[entityIdx].firestorePath}`;

      rootEntity$$ = this.entityRepository.getEntity$$(
        rootId,
        firestorePathOverride?.({
          url: urlParams
        }) ?? targetPath,
      ).pipe(
        tap(() => this.appService.loadingOff())
      );
    }

    if (!!nestedType && !!nestedId) {
      if (!this.sectionConfig.related || !(nestedType in this.sectionConfig.related)) {
        const message = `LIB: add ${nestedType} to ${this.entityService.entityConfig.entityId} -> sectionConfig (${this.sectionConfig.sectionKey}) -> relatedConfigs`
        this.notificationService.error(message);
        throw new Error(message);
      }

      const {
        config,
        entityIdx,
        firestorePathOverride,
      } = this.sectionConfig.related[nestedType];

      const targetPath = `${config.tabs[entityIdx].firestorePath}`;

      nestedEntity$$ = this.entityRepository.getEntity$$(
        nestedId,
        firestorePathOverride?.({
          url: urlParams
        }) ?? targetPath,
      ).pipe(
        tap(() => this.appService.loadingOff())
      );
    }

    if (!!queryType && !!queryId) {
      if (!this.sectionConfig.related || !(queryType in this.sectionConfig.related)) {
        const message = `LIB: add ${queryType} to ${this.entityService.entityConfig.entityId} -> sectionConfig (${this.sectionConfig.sectionKey}) -> relatedConfigs`

        this.notificationService.error(message);
        throw new Error(message);
      }

      const {
        config,
        entityIdx,
        firestorePathOverride,
      } = this.sectionConfig.related[queryType];

      const targetPath = `${config.tabs[entityIdx].firestorePath}`;

      queryEntity$$ = this.entityRepository.getEntity$$(
        queryId,
        firestorePathOverride?.({
          url: urlParams
        }) ?? targetPath,
      ).pipe(
        tap(() => this.appService.loadingOff())
      );
    }

    return new Promise((resolve, reject) => {
      this.appService.loadingOn();

      resolve({
        root: rootEntity$$,
        nested: nestedEntity$$,
        query: queryEntity$$,
      })
    });
  }
}

