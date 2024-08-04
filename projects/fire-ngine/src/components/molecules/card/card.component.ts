import { Component, Input, OnInit } from '@angular/core';

// ===================== MODELS =====================

import { ChipConfig, EntityAction, UrlEntities } from 'src/app/styleguide';
import { Entity, UserRole } from 'functions/src/styleguide/models';

// ===================== UTILITY =====================

// ===================== SERVICES =====================

import { EntityService } from '../../../services/entity.service';

// ===================== DEFINITIONS =====================

@Component({
  selector: 'lib-card',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent implements OnInit {

  @Input()
  public entity!: Entity;

  @Input()
  public context!: UrlEntities;

  @Input()
  public quickAction!: EntityAction;

  @Input()
  public quickActionState!: string;

  @Input()
  public showQuickAction!: boolean;

  @Input()
  public roles!: UserRole;

  public cardConfig = this.entityService.entityConfig.gridCard;

  public showLoading: boolean = true;

  public get title(): string {
    return this.cardConfig.title({
      entity: this.entity
    }) || '-';
  }

  public get subtitle(): string {
    return this.cardConfig.subtitle({
      entity: this.entity
    }) || '-';
  }

  public getImageUrl() {
    return this.cardConfig.image({
      entity: this.entity
    });
  }

  public get chips(): ChipConfig[] {
    return this.cardConfig.chips?.({
      entity: this.entity
    }) ?? [];
  }

  public get documentActions() {
    return this.entityService.entityConfig.documentActions.filter(
      action => !action.standalone && !action.hidden?.({
        entity: this.entity,
        context: this.context,
        viewSettings: this.entityService.viewSettings,
        roles: this.roles
      })
    );
  }

  constructor(
    private entityService: EntityService,
  ) { }

  ngOnInit(): void {
    // console.warn('----', this.entity, this.context)
  }

  public loadingOff() {
    this.showLoading = false;
  }

  public getImgHeight() {
    return this.chips.length ? '200px' : '225px';
  }

  public onChipClick($event: Event) {
    $event.preventDefault();
    $event.stopPropagation();
  }
}
