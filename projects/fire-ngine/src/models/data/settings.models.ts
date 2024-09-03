import { QueryFilter } from "..";


export type DataViewMode = 'grid' | 'table';
export type SortType = 'most-recent' | 'most-relevant' | 'custom-order' | 'active-first' | 'default-first';
export type SortDirection = 'desc' | 'asc';

export type VisibilitySettings = Record<string, boolean>

export interface PaginationSettings {
  querySize: number;
  pageSize: number;
  pageIndex: number;

  lastPageIndex?: number;
  anchorHead?: boolean;
  // queryHead?: QueryDocumentSnapshot;
  // queryTail?: QueryDocumentSnapshot;
};

export interface QuerySettings {
  paginator: PaginationSettings;

  /**
    * used in entity repository to provide an alternative to stats.createdAt
    */
  defaultOrderByField?: string;

  filters: QueryFilter[];
  tabFilters: QueryFilter[];
  sectionFilters: QueryFilter[];
  viewFilters: Record<string, QueryFilter>;
};

export interface SortSettings {
  sortType: SortType | null;
  sortDirection: SortDirection;
  sortProperty?: string;

  tableSortProperty: string | null;
  tableSortDirection: SortDirection;
};

export interface ViewSettings {
  displayType: DataViewMode;

  hiddenMap: VisibilitySettings;
  hideSidenav: boolean;

  sort: SortSettings;

  tableQuickActionId: string;
  cardQuickActionId: string;
  toolbarPinnedActionId: string;

  selectedTemplateId?: string;
};

export interface UserSettings {
  /**
   * used when signing up
   */
  email?: string;
};

export interface LocalStorageSettings {
  /**
   * user settings
   */
  user: UserSettings;

  /**
   * sectionId/entityId -> viewSettings
   */
  views: Record<string, ViewSettings>;

  /**
   * sectionId/entityId -> querySettings
   */
  queries: Record<string, QuerySettings>;
};
