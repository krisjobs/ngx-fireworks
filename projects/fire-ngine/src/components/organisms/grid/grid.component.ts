import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, Inject, Input, OnInit } from '@angular/core';
import { combineLatest, map } from 'rxjs';

// ===================== MODELS =====================

import { SectionConfig, UrlEntities } from 'src/app/styleguide';
import { Entity, UserRole } from 'functions/src/styleguide/models';

// ===================== UTILITY =====================

// ===================== SERVICES =====================

import { SECTION_CONFIG } from 'src/app/styleguide/services/app.providers';
import { Controller } from '../../../services/entity.controller';
import { EntityService } from '../../../services/entity.service';

// ===================== DEFINITIONS =====================

@Component({
  selector: 'fng-grid',
  standalone: true,
  templateUrl: './grid.component.html',
  styleUrls: ['./grid.component.scss']
})
export class GridComponent implements OnInit {

  @Input()
  public entities!: Entity[];

  @Input()
  public context!: UrlEntities;

  @Input()
  public roles!: UserRole;

  public cardSettings$ = combineLatest([
    this.entityService.cardQuickAction$,
    this.controller.actionStates$
  ]);

  /** Based on the screen size, switch from standard to one column per row */
  public numCols$ = combineLatest([
    this.breakpointObserver.observe(Breakpoints.Handset),
    this.breakpointObserver.observe(Breakpoints.Large),
  ])
    .pipe(
      map(([{ matches: matchesHandset }, { matches: matchesLarge }]) => {
        if (matchesHandset) {
          return 1;
        } else if (matchesLarge) {
          return 3
        } else {
          return 2;
        }
      })
    );

  public get showQuickAction() {
    return !!this.entityService.entityConfig.entitySettings.showCardQuickAction?.({
      entityConfig: this.entityService.entityConfig,
      context: this.context
    });
  }

  constructor(
    @Inject(SECTION_CONFIG) private sectionConfig: SectionConfig,
    private breakpointObserver: BreakpointObserver,
    private entityService: EntityService,
    private controller: Controller,
  ) { }

  ngOnInit(): void {
  }

}
