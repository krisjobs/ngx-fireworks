import { Validators } from "@angular/forms";

// ===================== MODELS =====================

import { StarRating, Entity } from "functions/src/styleguide/models";
import {
  EntityAction, QueryFilter,
  EntitySettings, FormField, FormStep, GridCard, PaginationState,
  QuerySettings, TableColumn, ViewSettings
} from "src/app/styleguide";

// ===================== DEFINITIONS =====================

// ! form steps

export const defaultFormSteps: FormStep[] = [
  // * information
  {
    name: 'information',
    title: 'Basic information',
    fields: [
      // * name
      {
        name: 'name',
        label: 'Name',
        type: 'input',
        value: ({
          entity
        }) => entity!.information?.name,
        validators: () => [
          Validators.required
        ]
      },
      // * description
      {
        name: 'description',
        label: 'Description',
        type: 'input',
        value: ({
          entity
        }) => entity!.information?.description ?? null,
        validators: () => [
        ]
      },
      // * notes
      {
        name: 'notes',
        label: 'Notes',
        type: 'textarea',
        value: ({
          entity
        }) => entity!.information?.notes ?? null,
      },
    ]
  },
  // * media
  {
    name: 'media',
    title: 'Kadro & media',
    fields: [
      // * defaultUrl
      {
        name: 'defaultUrl',
        label: 'Thumbnail URL',
        type: 'dropzone',
        value: ({
          entity
        }) => entity!.media?.defaultUrl ??
          'https://upload.wikimedia.org/wikipedia/commons/8/81/Wikimedia-logo.svg',
        expanded: true,
        validators: () => [
          Validators.required
        ]
      },
    ]
  },
];

// ! entity actions

export const defaultEntityActions: EntityAction[] = [
  // * col -> create-entity
  {
    id: 'create-entity',
    states: {
      ['default']: {
        value: () => 'add_circle_outline',
        label: ({
          entityConfig
        }) => `Create new ${entityConfig!.displayName}`,
        classes: ['red-icon'],
      }
    },
    type: () => 'icon',
  },
  // * doc -> edit-entity
  {
    id: 'edit-entity',
    states: {
      ['default']: {
        value: () => 'edit',
        label: ({
          entityConfig
        }) => `Edit ${entityConfig!.displayName}`,
      }
    },
    type: () => 'icon',
    hidden: ({
      entity
    }) => entity!.attributes.isArchived,
  },
  // * doc -> copy-entity
  {
    id: 'copy-entity',
    states: {
      ['default']: {
        value: () => 'content_copy',
        label: ({
          entityConfig
        }) => `Copy ${entityConfig!.displayName}`,
        classes: ['red-icon'],
      }
    },
    type: () => 'icon',
    hidden: ({
      entity
    }) => entity!.attributes.isArchived,
  },
  // * doc -> remove-entity
  {
    id: 'remove-entity',
    states: {
      ['default']: {
        value: () => 'archive',
        label: ({
          entityConfig
        }) => `Archive ${entityConfig!.displayName}`,
      },
      ['archived']: {
        value: () => 'unarchive',
        label: ({
          entityConfig
        }) => `Unarchive ${entityConfig!.displayName}`,
      }
    },
    type: () => 'icon',
  },
  // * doc -> share-entity
  {
    id: 'share-entity',
    states: {
      ['default']: {
        value: () => 'share',
        label: ({
          entityConfig
        }) => `Share ${entityConfig!.displayName}`,
      }
    },
    type: () => 'icon',
    hidden: ({
      entity
    }) => entity!.attributes.isArchived,
  },
  // * doc -> view-media
  {
    id: 'view-media',
    states: {
      ['default']: {
        value: () => 'file_open',
        label: () => `View media`,
      }
    },
    type: () => 'icon',
  },
  // * doc -> download-files
  {
    id: 'download-files',
    states: {
      ['default']: {
        value: () => 'cloud_download',
        label: () => `Download files`,
      }
    },
    type: () => 'icon',
  },
  // * standalone -> set-rating
  {
    id: 'set-rating',
    states: {
      ['low']: {
        value: () => StarRating[StarRating.star_outline],
        // label: (config: SectionConfig) => `Low rating`,
      },
      ['medium']: {
        value: () => StarRating[StarRating.star_half],
        // label: (config: SectionConfig) => `Medium rating`,
      },
      ['high']: {
        value: () => StarRating[StarRating.star],
        // label: (config: SectionConfig) => `High rating`,
      }
    },
    standalone: true,
    type: () => 'icon',
    disabled: ({
      entity,
    }) => entity!.attributes.isArchived,
  },
  // * standalone -> increment-seqNo
  {
    id: 'increment-seqNo',
    states: {
      ['default']: {
        value: () => 'arrow_upward',
      }
    },
    color: () => 'warn',
    type: () => 'icon',
    standalone: true,
  },
  // * standalone -> decrement-seqNo
  {
    id: 'decrement-seqNo',
    states: {
      ['default']: {
        value: () => 'arrow_downward',
      }
    },
    type: () => 'icon',
    color: () => 'primary',
    standalone: true,
  },
  // * sort -> most-recent
  {
    id: 'most-recent',
    states: {
      ['default']: {
        value: () => null,
        label: () => 'Most recent',
      },
      ['asc']: {
        value: () => 'arrow_upward',
        label: () => 'Most recent',
      },
      ['desc']: {
        value: () => 'arrow_downward',
        label: () => 'Most recent',
      }
    },
    type: () => 'icon',
    property: 'stats.updatedAt',
    trailingIcon: true,
    noDismiss: true,
  },
  // * sort -> most-relevant
  {
    id: 'most-relevant',
    states: {
      ['default']: {
        value: () => null,
        label: () => 'Most relevant',
      },
      ['asc']: {
        value: () => 'arrow_upward',
        label: () => 'Most relevant',
      },
      ['desc']: {
        value: () => 'arrow_downward',
        label: () => 'Most relevant',
      }
    },
    type: () => 'icon',
    property: 'attributes.rating',
    trailingIcon: true,
    noDismiss: true,
  },
  // * sort -> custom-order
  {
    id: 'custom-order',
    states: {
      ['default']: {
        value: () => null,
        label: () => 'Custom order',
      },
      ['asc']: {
        value: () => 'arrow_upward',
        label: () => 'Custom order',
      },
      ['desc']: {
        value: () => 'arrow_downward',
        label: () => 'Custom order',
      }
    },
    type: () => 'icon',
    property: 'attributes.seqNo',
    trailingIcon: true,
    noDismiss: true,
  },
  // * view -> show-archived
  {
    id: 'show-archived',
    states: {
      ['default']: {
        value: () => 'archive',
        label: () => 'Show archived',
      },
      ['visible']: {
        value: () => 'unarchive',
        label: () => 'Hide archived',
      },
      // ['archived-only']: {
      //   value: () => 'archive',
      //   label: () => 'Archived only',
      //   icon: 'outlined'
      // },
      // ['hide-archived']: {
      //   value: () => 'unarchive',
      //   label: () => 'Hide archived',
      // },
    },
    type: () => 'icon',
    noDismiss: true,
  },
  // * view -> show-seqNo
  {
    id: 'show-seqNo',
    states: {
      ['default']: {
        value: () => 'visibility',
        label: () => 'Show seqNo',
      },
      ['visible']: {
        value: () => 'visibility_off',
        label: () => 'Hide seqNo',
      },
    },
    type: () => 'icon',
    noDismiss: true,
    hidden: ({
      viewSettings
    }) => {
      return viewSettings!.displayType !== 'table'
    },
  },
];

// ! grid cards

export const defaultGridCard: GridCard = {
  title: ({
    entity
  }) => entity!.information.name,
  subtitle: ({
    entity
  }) => entity!.information.description,
  image: ({
    entity
  }) => entity!.media.defaultUrl ?? '',
  chips: () => [],
};

// ! table columns

export const defaultTableColumns: TableColumn[] = [
  // * name
  {
    columnDef: 'name',
    sortProperty: 'information.name',
    type: 'text',
    header: 'Name',
    cell: ({
      entity
    }) => entity!.information.name,
  },
  // * description
  {
    columnDef: 'description',
    sortProperty: 'information.description',
    type: 'text',
    header: 'Description',
    cell: ({
      entity
    }) => entity!.information.description,
  },
  // * seqNo
  {
    columnDef: 'seqNo',
    sortProperty: 'attributes.seqNo',
    type: 'number',
    incrementAction: 'increment-seqNo',
    decrementAction: 'decrement-seqNo',
    header: 'Sequence',
    cell: ({
      entity
    }) => `${entity!.attributes.seqNo}`,
  },
];

// ! settings

// ! filters
export const defaultFilters = [
  'searchName',
];

export const defaultEntityFilters: QueryFilter[] = [
  // * searchName
  {
    name: 'searchName',
    value: null,
    property: 'data.searchName',
    equality: false,
  },
];

export const defaultQueryFields: FormField[] = [
  // * searchName
  {
    name: 'searchName',
    label: 'Name',
    type: 'input',
    value: () => null,
  },
];


export function getDefaultEntitySettings(customSettings?: Partial<EntitySettings>) {
  return {
    dataViewModes: ['grid', 'table'],
    selectedFormIdx: 0,
    toolbarChips: (entity: Entity) => [],
    showToolbarPinnedAction: () => true,
    showCardQuickAction: () => true,
    showTableQuickAction: () => true,
    ...customSettings
  } as EntitySettings;
}

export function getDefaultQuerySettings(filters: QueryFilter[] = [], paginator?: Partial<PaginationState>): QuerySettings {
  const defaultPaginationState: PaginationState = {
    querySize: 11, // 2 * 5 + 1
    pageIndex: 0,
    lastPageIndex: 0,
    pageSize: 10,
    anchorHead: true,
  };

  const finalPaginator = {
    ...defaultPaginationState,
    ...paginator,
  };

  return {
    paginator: finalPaginator,

    filters,
    tabFilters: [],
    sectionFilters: [],
    viewFilters: {
      showArchived: {
        name: 'showArchived',
        value: false,
        property: 'attributes.isArchived',
        equality: true,
      },
    },
  };
};

export function getDefaultViewSettings(customSettings?: Partial<ViewSettings>): ViewSettings {
  return {
    displayType: 'grid',

    hiddenMap: {},

    sort: {
      sortType: 'most-recent',
      sortDirection: 'desc',

      tableSortProperty: null,
      tableSortDirection: 'desc',
    },

    cardQuickActionId: 'edit-entity',
    tableQuickActionId: 'edit-entity',
    toolbarPinnedActionId: 'create-entity',

    ...customSettings
  } as ViewSettings;
};
