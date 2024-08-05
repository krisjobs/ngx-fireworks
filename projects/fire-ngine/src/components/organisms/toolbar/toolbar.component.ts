import { ChangeDetectionStrategy, Component, Inject, Input, OnInit } from '@angular/core';
import { MatButtonToggleChange } from '@angular/material/button-toggle';
import { combineLatest, map, Observable, tap } from 'rxjs';

// ===================== MODELS =====================

import {
  DataViewMode, EntityFilter, SectionConfig,
  ChipConfig, ViewSettings, QuerySettings,
  UrlEntities
} from 'src/app/styleguide';
import { UserRole, Entity } from 'functions/src/styleguide/models';

// ===================== UTILITY =====================

import { getParamsFromUrl } from 'src/app/styleguide/utility';

// ===================== SERVICES =====================

import { EntityService } from '../../../services/entity.service';
import { Controller } from '../../../services/entity.controller';
import { SECTION_CONFIG } from 'src/app/styleguide/services/app.providers';
import { AppService } from 'src/app/styleguide/services/app.service';

// ===================== DEFINITIONS =====================

@Component({
  selector: 'fng-toolbar',
  standalone: true,
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ToolbarComponent implements OnInit {

  @Input()
  public context!: UrlEntities;

  @Input()
  public roles!: UserRole;

  @Input()
  public forTemplates: boolean = false;

  public currentUrl$ = this.appService.currentUrl$;

  public viewSettings$!: Observable<ViewSettings>;

  public querySettings$!: Observable<QuerySettings>;

  public hideSidenav$ = this.appService.hideSidenav$;

  public pinnedActionSettings$ = combineLatest([
    this.entityService.toolbarPinnedAction$,
    this.controller.actionStates$
  ]);

  public isDefaultQuery$!: Observable<boolean>;

  public get chips(): ChipConfig[] {
    const chips = !!this.context ? this.entityService.entityConfig.entitySettings.toolbarChips?.({
      context: this.context
    }) ?? [] : [];
    return chips;
  }

  public get overviewTypes() {
    return this.entityService.entityConfig.entitySettings.dataViewModes;
  }

  public getViewActions(viewSettings: ViewSettings, url: string) {
    const actions = !this.forTemplates || !this.sectionConfig.templates ?
      this.entityService.entityConfig.viewActions :
      this.sectionConfig.templates[this.entityService.activeFormIdx].viewActions;

    return actions.filter(
      action => !action.standalone && !action.hidden?.({
        context: this.context,
        viewSettings,
        roles: this.roles,
        url: getParamsFromUrl(url)
      })
    );
  }

  public getSortActions(viewSettings: ViewSettings, url: string) {
    const actions = !this.forTemplates || !this.sectionConfig.templates ?
      this.entityService.entityConfig.sortActions :
      this.sectionConfig.templates[this.entityService.activeFormIdx].sortActions;

    return actions.filter(
      action => !action.standalone && !action.hidden?.({
        context: this.context,
        viewSettings,
        roles: this.roles,
        url: getParamsFromUrl(url)
      })
    );
  }

  public getFilterFields() {
    const filterFields = !this.forTemplates || !this.sectionConfig.templates ?
      this.entityService.entityConfig.filterFields :
      this.sectionConfig.templates[this.entityService.activeFormIdx].filterFields;

    // console.warn(this.forTemplates, filterFields, this.sectionConfig.templates, this.entityService.activeFormIdx)
    return filterFields;
  }

  public getCollectionActions(url: string) {
    return this.entityService.entityConfig.collectionActions.filter(
      action => !action.standalone && !action.hidden?.({
        entity: this.context.query as Entity,
        context: this.context,
        viewSettings: this.entityService.viewSettings,
        roles: this.roles,
        url: getParamsFromUrl(url)
      })
    );
  }

  public showPinnedAction(url: string) {
    return this.entityService.entityConfig.entitySettings.showToolbarPinnedAction?.({
      entityConfig: this.entityService.entityConfig,
      context: this.context,
      url: getParamsFromUrl(url)
    });
  }

  public get showChips() {
    return !!this.entityService.entityConfig.entitySettings.showToolbarChips?.({
      entityConfig: this.entityService.entityConfig,
      context: this.context
    });
  }

  constructor(
    @Inject(SECTION_CONFIG) private sectionConfig: SectionConfig,
    private entityService: EntityService,
    private controller: Controller,
    private appService: AppService,
  ) { }

  ngOnInit(): void {
    this.querySettings$ = !this.forTemplates ?
      this.entityService.querySettings$ :
      this.entityService.templateSettings$;

    this.viewSettings$ = !this.forTemplates ?
      this.entityService.viewSettings$ :
      this.entityService.contextSettings$;

    this.isDefaultQuery$ = this.querySettings$.pipe(
      map(() => !this.forTemplates ?
        this.entityService.isDefaultQuery() :
        this.entityService.isDefaultTemplateQuery()
      ),
    );
  }

  public clearFilters() {
    if (!this.forTemplates) {
      this.entityService.querySettings = null!;
    } else {
      this.entityService.templateSettings = null!;
    }
  }

  public onSelectView(change: MatButtonToggleChange) {
    const viewUpdate = {
      displayType: change.value as DataViewMode,
    };

    if (!this.forTemplates) {
      this.entityService.viewSettings = viewUpdate
    } else {
      this.entityService.contextSettings = viewUpdate
    }
  }

  public applyFilters(filters: EntityFilter[]) {
    if (!this.forTemplates) {
      this.entityService.querySettings = { filters };
    } else {
      this.entityService.templateSettings = { filters };
    }
  }

  public hideSidenav() {
    this.appService.toggleSidenav();
  }
}
