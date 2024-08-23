import { Component, Inject, OnInit } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { ActivatedRoute } from '@angular/router';
import { combineLatest, map, Observable, of, switchMap, tap } from 'rxjs';

// ===================== MODELS =====================

import { Entity } from 'functions/src/styleguide/models';
import { SectionConfig, UrlEntities } from 'src/app/styleguide';

// ===================== UTILITY =====================

// ===================== SERVICES =====================

import { AuthService } from 'src/app/styleguide/modules/firebase/services/auth.service';
import { SECTION_CONFIG } from 'src/app/styleguide/services/app.providers';
import { AppService } from 'src/app/styleguide/services/app.service';
import { EntityService } from '../../../services/entity.service';

// ===================== DEFINITIONS =====================

@Component({
  selector: 'fng-data-view',
  standalone: true,
  templateUrl: './data-view.component.html',
  styleUrls: ['./data-view.component.scss'],
})
export class DataViewComponent implements OnInit {

  public queryEntities$$!: Observable<Entity[]>;
  public contextEntities$$!: Observable<UrlEntities>;

  public userRoles$ = this.authService.userRoles$$;
  public currentUrl$ = this.appService.currentUrl$;

  public activeTabIdx$ = this.entityService.activeTabIdx$.pipe(
    map(activeTabIdx => ({
      value: activeTabIdx
    })),
  );
  public viewSettings$ = this.entityService.viewSettings$;
  public querySettings$ = this.entityService.querySettings$;

  /**
   * only 1 tab and hidden - still displays
   */
  public get tabs() {
    return this.sectionConfig.tabs;
  };

  constructor(
    @Inject(SECTION_CONFIG) private sectionConfig: SectionConfig,
    private entityService: EntityService,
    private route: ActivatedRoute,
    private authService: AuthService,
    private appService: AppService,
  ) {
    if (this.entityService.entityConfig.autoClearFilters) {
      this.entityService.querySettings = null!;
    }
  }

  ngOnInit(): void {
    const rootEntity$$ = this.route.data.pipe(
      switchMap(({
        related: {
          root,
        },
      }) => {
        return ((root as Observable<Entity> | undefined) ?? of(null))
      }),
    );

    const nestedEntity$$ = this.route.data.pipe(
      switchMap(({
        related: {
          nested,
        },
      }) => {
        return ((nested as Observable<Entity> | undefined) ?? of(null))
      }),
    );

    const queryEntity$$ = this.route.data.pipe(
      switchMap(({
        related: {
          query,
        },
      }) => {
        return ((query as Observable<Entity> | undefined) ?? of(null))
      }),
    );

    this.contextEntities$$ = combineLatest([
      rootEntity$$,
      nestedEntity$$,
      queryEntity$$,
    ]).pipe(
      tap(console.warn),
      map(([root, nested, query]) => ({
        root,
        nested,
        query,
      }))
    );

    this.queryEntities$$ = this.route.data.pipe(
      switchMap(({
        [this.entityService.entityConfig.entityId]: entitiesObs,
      }) => (entitiesObs as Observable<Entity[]>)),
      tap((entities) => {
        console.warn('===overview===', entities)
      })
    );
  }

  public onTabIndexChange(tabIdx: number) {
    this.entityService.activeTabIdx = tabIdx;
  }

  public onPaginatorChange($event: PageEvent, entities: Entity[]) {
    const oldReturnedSize = entities.length;

    this.entityService.onPaginatorChange(
      $event,
      oldReturnedSize,
      (entities[0] as any)?.qry,
      (entities[oldReturnedSize - 1] as any)?.qry,
    );
  }
}
