import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { combineLatest, map } from 'rxjs';

// ===================== MODELS =====================

import { EntityAction, SectionConfig, UrlEntities } from 'src/app/styleguide';
import { Entity } from 'functions/src/styleguide/models';

// ===================== UTILITY =====================

import { getParamsFromUrl } from 'src/app/styleguide/utility';

// ===================== SERVICES =====================

import { SECTION_CONFIG } from 'src/app/styleguide/services/app.providers';
import { AppService } from 'src/app/styleguide/services/app.service';
import { ErrorService } from 'src/app/styleguide/services/error.service';
import { EntityAdapter } from '../../../services/entity.adapter';
import { EntityService } from '../../../services/entity.service';

// ===================== DEFINITIONS =====================

@Component({
  selector: 'lib-state-button',
  templateUrl: './state-button.component.html',
  styleUrls: ['./state-button.component.scss']
})
export class StateButtonComponent implements OnInit {

  @Input()
  public action!: EntityAction;

  @Input()
  public state!: string;

  @Input()
  public entity?: Entity;

  @Input()
  public context?: UrlEntities;

  @Input()
  public forMenu = false;

  @Input()
  public forTemplates = false;

  @Input()
  public hideLabel = false;

  @Output()
  public click = new EventEmitter<[EntityAction, Event]>();

  public isSet!: boolean;

  public context$ = combineLatest([
    this.appService.currentUrl$,
    this.entityService.viewSettings$
  ]).pipe(
    map(
      ([
        currentUrl,
        viewSettings,
      ]) => ({
        currentUrl,
        viewSettings,
      })
    )
  );

  public get actionClassAttr(): string | void {
    const actionState = this.errorService.throwErrorIfNotExist(
      `Invalid state: ${this.state}`,
      this.action.states[this.state],
      {
        states: this.action.states,
        state: this.state
      }
    );

    const classes = actionState.classes;
    if (!!classes && !!classes.length) {
      return classes.join(' ');
    }
  }

  public getStyle(key: string) {
    return this.action.states[this.state].styles?.({
      sectionConfig: this.sectionConfig,
      entity: this.entity,
      context: this.context,
    })?.[key];
  }

  public getColor(action: EntityAction, url: string) {
    return action.color?.({
      sectionConfig: this.sectionConfig,
      entity: this.entity,
      context: this.context,
      url: getParamsFromUrl(url),
    });
  }

  public get actionValue(): string | number | boolean | null {
    return this.action.states[this.state].value({
      sectionConfig: this.sectionConfig,
      entityConfig: this.entityService.entityConfig,
      entity: this.entity,
      context: this.context,
    });
  }

  public getActionLabel(url: string): string | undefined {
    return this.action.states[this.state].label?.({
      sectionConfig: this.sectionConfig,
      entityConfig: this.entityService.entityConfig,
      entity: this.entity,
      context: this.context,
      url: getParamsFromUrl(url),
    });
  }

  constructor(
    @Inject(SECTION_CONFIG) private sectionConfig: SectionConfig,
    private entityService: EntityService,
    private entityAdapter: EntityAdapter,
    private appService: AppService,
    private errorService: ErrorService,
  ) { }

  ngOnInit(): void {
  }

  public getIconClass(): string {
    switch (this.action.states[this.state].icon) {
      case 'outlined':
        return 'material-icons-outlined';
      case 'filled':
        return 'material-icons';
      default:
        return 'material-icons-round';
    }
  }

  private invokeAction(url: string, data?: string) {
    if (this.action.disabled?.({
      sectionConfig: this.sectionConfig,
      entityConfig: this.entityService.entityConfig,
      entity: this.entity,
      context: this.context,
    })) {
      return;
    }

    this.entityAdapter.invokeAction({
      action: this.action,
      url: getParamsFromUrl(url),
      entity: this.entity,
      context: this.context,
      forTemplates: this.forTemplates,
      data
    });
  }

  public onActionButtonClick($event: Event, url: string, data?: string) {
    $event.preventDefault();

    if (this.forMenu) {
      return;
    } else {
      $event.stopPropagation();
    }

    this.invokeAction(url, data);
  }

  public onMenuButtonClick($event: Event, url: string, data?: string) {
    if (this.action.noDismiss) {
      $event.stopPropagation();
    }

    this.invokeAction(url, data);
  }
}
