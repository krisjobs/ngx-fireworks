import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

// ===================== MODELS =====================

import { EntityAction, EntityActionStates, UrlEntities } from 'src/app/styleguide';
import { Entity } from 'functions/src/styleguide/models';

// ===================== SERVICES =====================

import { Controller } from '../../../services/entity.controller';

// ===================== DEFINITIONS =====================

@Component({
  selector: 'fng-actions-menu',
  standalone: true,
  templateUrl: './actions-menu.component.html',
  styleUrls: ['./actions-menu.component.scss']
})
export class ActionsMenuComponent implements OnInit, OnDestroy {

  @Input()
  public mode: 'icon' | 'button' = 'icon';

  @Input()
  public actions: EntityAction[] = [];

  @Input()
  public label?: string; // mode === 'button'

  @Input()
  public icon: string = 'more_vert';

  @Input()
  public entity?: Entity;

  @Input()
  public context!: UrlEntities;

  @Input()
  public forTemplates: boolean = false;

  public actionStates!: EntityActionStates;

  private actionStatesSubscription!: Subscription;

  constructor(
    private controller: Controller,
  ) { }

  ngOnInit(): void {
    const actionStates$ = !this.forTemplates ?
      this.controller.actionStates$ :
      this.controller.templateActionStates$;

    this.actionStatesSubscription = actionStates$.subscribe(
      {
        next: (actionStates) => this.actionStates = actionStates
      }
    );
  }

  ngOnDestroy(): void {
    this.actionStatesSubscription.unsubscribe();
  }

}
