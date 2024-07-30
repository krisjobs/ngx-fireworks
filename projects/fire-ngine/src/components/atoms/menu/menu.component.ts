import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { Subscription } from 'rxjs';

// ===================== MODELS =====================

import { EntityAction, EntityActionStates, UrlEntities } from 'src/app/styleguide';
import { Entity } from 'functions/src/styleguide/models';

// ===================== SERVICES =====================

import { EntityAdapter } from '../../../services/entity.adapter';

// ===================== DEFINITIONS =====================

@Component({
  selector: 'lib-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit, OnDestroy {

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
    private entityAdapter: EntityAdapter,
  ) { }

  ngOnInit(): void {
    const actionStates$ = !this.forTemplates ?
      this.entityAdapter.actionStates$ :
      this.entityAdapter.templateActionStates$;

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
