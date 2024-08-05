import { QueryDocumentSnapshot } from "@angular/fire/firestore";

import { ChipConfig, ConfigParams, EntityFilter, SelectOption } from "..";


export type DataViewMode = 'grid' | 'table';
export type SortType = 'most-recent' | 'most-relevant' | 'custom-order' | 'active-first' | 'default-first';
export type SortDirection = 'desc' | 'asc';

export type VisibilitySettings = Record<string, boolean>

export interface PaginatorSettings {
  querySize: number;
  pageSize: number;
  pageIndex: number;
  lastPageIndex: number | undefined;
  anchorHead: boolean | undefined;
  queryHead?: QueryDocumentSnapshot;
  queryTail?: QueryDocumentSnapshot;
};

export interface SortSettings {
  sortType: SortType | null;
  sortDirection: SortDirection;
  sortProperty?: string;

  tableSortProperty: string | null;
  tableSortDirection: SortDirection;
};

// ===================== MAIN =====================

export interface QuerySettings {
  paginator: PaginatorSettings;

  /**
    * used in entity repository to provide an alternative to stats.createdAt
    */
  defaultOrderByField?: string;

  filters: EntityFilter[];
  tabFilters: EntityFilter[];
  sectionFilters: EntityFilter[];
  viewFilters: Record<string, EntityFilter>;
};

export interface EntitySettings {
  dataViewModes: DataViewMode[];
  selectedFormIdx: number;
  categories?: SelectOption[]; // value -> icon

  toolbarChips?: (params: Partial<ConfigParams>) => ChipConfig[];
  showToolbarChips?: (params: Partial<ConfigParams>) => boolean;
  showToolbarPinnedAction?: (params: Partial<ConfigParams>) => boolean;
  showTableQuickAction?: (params: Partial<ConfigParams>) => boolean;
  showCardQuickAction?: (params: Partial<ConfigParams>) => boolean;
}

export interface ViewSettings {
  displayType: DataViewMode;

  hiddenMap: VisibilitySettings;
  hideSidenav: boolean;

  sort: SortSettings;

  selectedTemplateId?: string;
  tableQuickActionId: string;
  cardQuickActionId: string;
  toolbarPinnedActionId: string;
};
