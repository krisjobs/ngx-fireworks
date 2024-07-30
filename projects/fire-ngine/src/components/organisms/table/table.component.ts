import { trigger, state, style, transition, animate } from '@angular/animations';
import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { PageEvent } from '@angular/material/paginator';
import { Sort } from '@angular/material/sort';
import { combineLatest, map, Observable } from 'rxjs';

// ===================== MODELS =====================

import {
  ConfigParams, SectionConfig, SortSettings, TableColumn,
  UrlEntities, UrlParams, ViewSettings
} from 'src/app/styleguide';
import { Entity, UserRoles } from 'functions/src/styleguide/models';

// ===================== UTILITY =====================

import { orgAccess } from 'src/app/shared/utility/auth-access';
import { getParamsFromUrl } from 'src/app/styleguide/utility';

// ===================== SERVICES =====================

import { SECTION_CONFIG } from 'src/app/styleguide/services/app.providers';
import { AppService } from 'src/app/styleguide/services/app.service';
import { EntityAdapter } from '../../../services/entity.adapter';
import { EntityService } from '../../../services/entity.service';

// ===================== DEFINITIONS =====================

@Component({
  selector: 'lib-table',
  templateUrl: './table.component.html',
  styleUrls: ['./table.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
    ]),
  ],
})
export class TableComponent implements OnInit {

  @Input()
  public entities!: Entity[];

  @Input()
  public context!: UrlEntities;

  @Input()
  public forTemplates: boolean = false;

  @Input()
  public roles!: UserRoles;

  @Output('selectedEntity')
  public $selectedEntity = new EventEmitter<Entity>();

  private urlParams?: UrlParams;

  public asyncData$!: Observable<any>;

  public viewSettings$!: Observable<ViewSettings>;
  public templateSettings$ = this.entityService.templateSettings$;

  public quickActionSettings$ = combineLatest([

  ]);

  public numberCellSettings$ = combineLatest([
    this.entityAdapter.actionStates$
  ]);

  public getIncrementAction(column: TableColumn) {
    return this.entityService.getAction(column.incrementAction!);
  }

  public getDecrementAction(column: TableColumn) {
    return this.entityService.getAction(column.decrementAction!);
  }

  public get columns() {
    return !this.forTemplates ?
      this.entityService.entityConfig.tableColumns :
      this.entityService.templateConfig?.tableColumns ?? [];
  }

  public getDisplayedColumns(viewSettings: ViewSettings, url: string) {
    this.urlParams = getParamsFromUrl(url);

    const entityColumns = this.columns
      .filter(
        column => !column.hidden?.({
          data: !!this.context?.query,
          flag: this.forTemplates,
          url: getParamsFromUrl(url)
        }) && !viewSettings.hiddenMap[column.columnDef]
      )
      .map(
        column => column.columnDef
      );

    if (this.showQuickAction) {
      entityColumns.unshift('quick');
    }

    if (this.showMenuColumn) {
      entityColumns.push('menu');
    }

    return entityColumns;
  }

  public expandedEntity!: Entity | null;

  public get showQuickAction() {
    const showQuickAction = this.entityService.entityConfig.entitySettings.showTableQuickAction?.({
      entityConfig: this.entityService.entityConfig,
      context: this.context
    }) && !this.forTemplates;
    return showQuickAction;
  }

  public get showMenuColumn() {
    return !this.forTemplates;
  }

  constructor(
    @Inject(SECTION_CONFIG) private sectionConfig: SectionConfig,
    private entityService: EntityService,
    private entityAdapter: EntityAdapter,
    private appService: AppService,
  ) { }

  ngOnInit(): void {
    this.viewSettings$ = !this.forTemplates ?
      this.entityService.viewSettings$ :
      this.entityService.contextSettings$;

    this.asyncData$ = combineLatest([
      this.appService.currentUrl$,
      this.viewSettings$,
      this.entityService.tableQuickAction$,
      this.entityAdapter.actionStates$
    ]).pipe(
      map(([
        currentUrl,
        viewSettings,
        tableQuickAction,
        actionStates
      ]) => ({
        currentUrl,
        viewSettings,
        displayColumns: this.getDisplayedColumns(viewSettings, currentUrl),
        quickAction: tableQuickAction,
        actionStates,
        quickActionState: actionStates[tableQuickAction.id]
      })),
      // tap(console.warn)
    );
  }

  public getDocumentActions(entity: Entity) {
    return this.entityService.entityConfig.documentActions.filter(
      action => !action.standalone && !action.hidden?.({
        entity,
        context: this.context,
        viewSettings: this.entityService.viewSettings,
        roles: this.roles
      })
    );
  }

  public onRowClick(entity: Entity) {
    if (this.forTemplates) {
      this.$selectedEntity.emit(entity);
    }
  }

  public onSortChange(sortChange: Sort) {
    const sortUpdate: SortSettings = {
      ...(!this.forTemplates ?
        this.entityService.viewSettings.sort :
        this.entityService.contextSettings.sort),
      tableSortProperty: !!sortChange.direction ? sortChange.active : null,
      tableSortDirection: !!sortChange.direction ? sortChange.direction : 'asc',
    };

    if (!this.forTemplates) {
      this.entityService.viewSettings = {
        sort: sortUpdate
      };
    } else {
      this.entityService.contextSettings = {
        sort: sortUpdate
      };
    }
  }

  public onPaginatorChange($event: PageEvent, entities: Entity[]) {
    const oldReturnedSize = entities.length;

    this.entityService.onPaginatorChange(
      $event,
      oldReturnedSize,
      (entities[0] as any)?.qry,
      (entities[oldReturnedSize - 1] as any)?.qry,
      true
    );
  }

  public onRowDblClick(params: Partial<ConfigParams>) {
    const {
      entity,
    } = params;

    if (!this.forTemplates && !!orgAccess(this.roles)) {
      this.entityAdapter.invokeAction(
        {
          entity,
          context: this.context,
          action: { id: 'edit-entity' },
          url: this.urlParams
        } as any
      );
    }
  }
}
