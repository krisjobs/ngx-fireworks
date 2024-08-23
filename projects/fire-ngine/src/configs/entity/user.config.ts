import { Validators } from "@angular/forms";

// ===================== MODELS =====================

import { UserTypes } from "src/app/core/models";
import { Entity, User } from "functions/src/styleguide/models";
import {
  FormStep, TableColumn, GridCard, EntityAction,
  QueryFilter, FormField, EntitySettings,
  PaginationState, QuerySettings, ViewSettings
} from "src/app/styleguide";
// ===================== UTILITY =====================

import { isAdmin } from "src/app/shared/utility/auth-access";
import { getEnumOptions } from "src/app/styleguide/utility";
import { userRoles } from "src/app/core/configs";
import { defaultEntityActions, defaultFormSteps } from "src/app/styleguide/modules/library/configs";

// ===================== DEFINITIONS =====================

// ! form steps

export const userFormSteps: FormStep[] = [
  // * information
  {
    name: 'information',
    title: 'User information',
    fields: [
      // * email
      {
        name: 'email',
        label: 'Email',
        type: 'input',
        value: ({
          entity
        }) => (entity as User).information?.email,
        validators: () => [
          Validators.email
        ]
      },
      // * name
      {
        name: 'name',
        label: 'User name',
        type: 'input',
        value: ({
          entity
        }) => entity!.information?.name ?? null,
      },
      // * notes
      defaultFormSteps[0].fields[2]
    ]
  },
  // * media
  {
    name: 'media',
    title: 'User media',
    fields: [
      // * defaultUrl
      {
        name: 'defaultUrl',
        label: 'Thumbnail URL',
        type: 'dropzone',
        value: ({
          entity
        }) => {
          const user = entity as User;

          return user.media?.defaultUrl ??
            'https://helpx.adobe.com/content/dam/help/en/illustrator/how-to/character-design/jcr_content/main-pars/image/character-design-intro_900x506.jpg.img.jpg';
        },
        expanded: true,
        validators: () => [
          Validators.required
        ]
      },
    ]
  },
  // * roles
  userRoles
];

// ! table columns

export const userTableColumns: TableColumn[] = [
  {
    columnDef: 'name',
    sortProperty: 'information.name',
    type: "text",
    header: 'User name',
    cell: ({
      entity
    }) => entity!.information?.name,
  }
];

// ! grid cards

export const userGridCard: GridCard = {
  title: ({
    entity
  }) => {
    const user = entity as User;
    return `${user.information?.name ?? user.information?.email?.split('@')[0] ?? '-'}`;
  },
  subtitle: ({
    entity
  }) => {
    const user = entity as User;
    return `${user.information?.email ?? '-'}`;
  },
  image: ({
    entity
  }) => {
    const user = entity as User;
    return user.media?.defaultUrl || null!;
  },
  chips: () => [],
};

// ! entity actions

export const userEntityActions: EntityAction[] = [
  ...defaultEntityActions,
  // ! override col -> create-entity
  {
    id: 'create-entity',
    states: {
      ['default']: {
        value: () => 'add_circle_outline',
        label: ({
          entityConfig
        } = {}) => `Create new ${entityConfig!.displayName}`,
        classes: ['red-icon'],
      }
    },
    type: () => 'icon',
    // hidden: (_, __, ___, roles) => orgAccess(roles!),
  },
  // * view -> show-verified
  {
    id: 'show-verified',
    states: {
      ['default']: {
        value: () => 'check_circle',
        label: () => 'Show all users',
      },
      ['hide-verified']: {
        value: () => 'check_circle',
        label: () => 'Hide verified',
        icon: 'outlined'
      },
      ['verified-only']: {
        value: () => 'verified',
        label: () => 'Verified only',
      },
    },
    type: () => 'icon',
    noDismiss: true,
  },
  // * col -> share-network
  {
    id: 'share-network',
    states: {
      ['default']: {
        value: () => 'group_add',
        label: () => 'Share network',
      },
    },
    type: () => 'icon',
    standalone: true,
    trailingIcon: false,
  },
  // * doc -> send-invitation
  {
    id: 'send-invitation',
    states: {
      ['default']: {
        value: () => 'mail_outline',
        label: () => `Send invitation`,
      }
    },
    type: () => 'icon',
    hidden: ({
      entity
    } = {}) => !!(entity as User)?.stats?.emailVerified,
  },
  // * doc -> sync-auth
  {
    id: 'sync-auth',
    states: {
      ['default']: {
        value: () => 'sync',
        label: () => `Sync auth`,
      }
    },
    type: () => 'icon',
    hidden: ({
      entity
    } = {}) => entity!.attributes.isArchived,
  },
  // * doc -> set-connections
  {
    id: 'set-connections',
    states: {
      ['default']: {
        value: () => 'group',
        label: () => `Set connections`,
      }
    },
    type: () => 'icon',
    hidden: ({
      entity,
      roles
    } = {}) => entity!.attributes.isArchived || !isAdmin(roles!),
    color: () => 'primary',
  },
  // * doc -> assign-team
  {
    id: 'assign-team',
    states: {
      ['default']: {
        value: () => 'groups',
        label: () => 'Assign team',
      },
    },
    color: () => 'primary',
    type: () => 'icon',
    hidden: ({
      roles
    } = {}) => !roles!.admin,
  },
  // * doc -> remove-contact
  {
    id: 'remove-contact',
    states: {
      ['default']: {
        value: () => 'sync',
        label: () => `Remove contact`,
      }
    },
    type: () => 'icon',
    hidden: ({
      entity
    } = {}) => entity!.attributes.isArchived,
  },
  // * doc -> connect-user
  {
    id: 'connect-user',
    states: {
      ['connected']: {
        value: () => true,
      },
      ['not-connected']: {
        value: () => false,
      }
    },
    standalone: true,
    disabled: ({
      entity
    } = {}) => entity!.attributes.isArchived,
    type: ({
      viewSettings
    } = {}) => viewSettings!.displayType === 'table' ? 'checkbox' : 'switch',
  },
  // * doc -> subscribe-user
  {
    id: 'subscribe-user',
    states: {
      ['subscribed']: {
        value: () => true,
      },
      ['not-subscribed']: {
        value: () => false,
      }
    },
    color: () => 'primary',
    standalone: true,
    disabled: ({
      entity
    } = {}) => entity!.attributes.isArchived,
    type: ({
      viewSettings
    } = {}) => viewSettings!.displayType === 'table' ? 'checkbox' : 'switch',
  },
  // * doc -> relate-user
  {
    id: 'relate-user',
    states: {
      ['related']: {
        value: () => true,
      },
      ['not-related']: {
        value: () => false,
      }
    },
    color: () => 'primary',
    standalone: true,
    disabled: ({
      entity
    } = {}) => entity!.attributes.isArchived,
    type: ({
      viewSettings
    } = {}) => viewSettings!.displayType === 'table' ? 'checkbox' : 'switch',
  },
  // * doc -> network-associate
  {
    id: 'network-associate',
    states: {
      ['networked']: {
        value: () => true,
      },
      ['not-networked']: {
        value: () => false,
      }
    },
    color: () => 'primary',
    standalone: true,
    disabled: ({
      entity
    } = {}) => entity!.attributes.isArchived,
    type: ({
      viewSettings
    } = {}) => viewSettings!.displayType === 'table' ? 'checkbox' : 'switch',
  },
];

// ! filters

export const userFilters = [
  'userType'
];

export const userEntityFilters: QueryFilter[] = [
  // * userType
  {
    name: 'userType',
    value: null,
    property: 'attributes.type',
    equality: true,
  },
  // * searchName
  {
    name: 'searchName',
    value: null,
    property: 'data.searchName',
    equality: false,
  },
];

export const userQueryFields: FormField[] = [
  // * userType
  {
    name: 'userType',
    label: 'User type',
    type: 'select',
    value: () => null,
    options: () => getEnumOptions(UserTypes),
  },
  // * searchName
  {
    name: 'searchName',
    label: 'Name',
    type: 'input',
    value: (name: any) => name?.split(' ').join(''),
  },
];

// ! custom options

// ! settings

export function getUserEntitySettings(
  entity?: Entity,
  customSettings?: Partial<EntitySettings>
): EntitySettings {
  return {
    dataViewModes: ['grid', 'table'],
    categories: [],
    selectedFormIdx: 0,
    toolbarChips: (entity) => [],
    showCardQuickAction: () => true,
    showTableQuickAction: () => true,
    ...customSettings
  } as EntitySettings;
};

export function getUserViewSettings(
  customSettings?: Partial<ViewSettings>
): ViewSettings {
  return {
    displayType: 'table',

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

export function getUserQuerySettings(
  entityFilters: QueryFilter[] = [],
  paginator?: Partial<PaginationState>,
  ...defaultFilters: QueryFilter[]
): QuerySettings {
  const defaultPaginationState: PaginationState = {
    querySize: 11, // 2 * 5 + 1
    pageIndex: 0,
    lastPageIndex: 0,
    pageSize: 10,
    anchorHead: true,
  };

  // TODO extract to utility
  const defaultFiltersObject = defaultFilters.reduce(
    (newFilters, filter) => {
      return {
        ...newFilters,
        [filter.name]: filter
      }
    },
    {} as { [filterId: string]: QueryFilter; }
  );

  return {
    paginator: {
      ...defaultPaginationState,
      ...paginator
    },

    filters: entityFilters,
    tabFilters: [],
    sectionFilters: [],
    viewFilters: {
      ...defaultFiltersObject,
      showArchived: {
        name: 'showArchived',
        value: false,
        property: 'attributes.isArchived',
        equality: true,
      },
    },
  };
};



import {
  getUserEntitySettings, getUserViewSettings, getUserQuerySettings,
  userEntityActions, userTableColumns, userGridCard, userFormSteps,
  userQueryFields, userEntityFilters,
  userFilters
} from "..";
import { SectionConfig, EntityConfig } from "src/app/styleguide";
import { selectFromArray } from "../../../utility";

// ===================== ENTITIES =====================

export const usersEntityConfig: EntityConfig = {
  entityId: 'user',
  firestorePath: 'users',
  displayName: 'user',
  icon: 'person',
  // TODO also sort according to another array
  entitySettings: {
    ...getUserEntitySettings(),
  },
  viewSettings: getUserViewSettings(),
  querySettings: getUserQuerySettings(
    selectFromArray(userFilters, userEntityFilters, 'name'),
    undefined,
    {
      name: 'showVerified',
      value: true,
      property: 'stats.emailVerified',
      equality: true,
    }
  ),

  formSteps: userFormSteps,
  queryFields: selectFromArray(userFilters, userQueryFields, 'name'),

  gridCard: userGridCard,
  tableColumns: selectFromArray([
    'name'
  ], userTableColumns, 'columnDef'),

  viewActions: selectFromArray([
    'show-archived',
    'show-verified',
  ], userEntityActions, 'id'),
  sortActions: selectFromArray([
    'most-recent',
  ], userEntityActions, 'id'),

  collectionActions: selectFromArray([
    'create-entity',
  ], userEntityActions, 'id'),
  documentActions: selectFromArray([
    'set-connections',
    'send-invitation',
    'sync-auth',
    'edit-entity',
    // 'copy-entity', // TODO copy should create auth entry
    'remove-entity',
    'set-rating',
  ], userEntityActions, 'id'),
};

// ===================== SECTIONS =====================

export const usersSectionConfig: SectionConfig = {
  sectionFilters: [
    // {
    //   name: 'isVerified',
    //   property: 'stats.emailVerified',
    //   value: true,
    // }
  ],
  sectionKey: 'users',
  tabs: [
    usersEntityConfig,
  ],
};

import {
  getUserEntitySettings, getUserViewSettings, getUserQuerySettings,
  userEntityActions, userTableColumns, userGridCard, userFormSteps,
  userQueryFields, userEntityFilters,
  userFilters
} from "..";
import { SectionConfig, EntityConfig } from "src/app/styleguide";
import { selectFromArray } from "../../../utility";

// ===================== ENTITIES =====================

const connectionsEntityConfig: EntityConfig = {
  entityId: 'connection',
  firestorePath: 'users',
  displayName: 'user',
  icon: 'person',
  // TODO also sort according to another array
  entitySettings: {
    ...getUserEntitySettings(undefined, {
      showToolbarPinnedAction: () => false,
    }),
  },
  viewSettings: getUserViewSettings({
    cardQuickActionId: 'connect-user',
    tableQuickActionId: 'connect-user',
  }),
  querySettings: getUserQuerySettings(selectFromArray(userFilters, userEntityFilters, 'name')),

  formSteps: userFormSteps,
  queryFields: selectFromArray(userFilters, userQueryFields, 'name'),

  gridCard: userGridCard,
  tableColumns: selectFromArray([
  ], userTableColumns, 'columnDef'),

  viewActions: selectFromArray([
    'show-archived',
  ], userEntityActions, 'id'),
  sortActions: selectFromArray([
    'most-recent',
  ], userEntityActions, 'id'),

  collectionActions: selectFromArray([
    'create-entity',
  ], userEntityActions, 'id'),

  documentActions: selectFromArray([
    'sync-auth',
    'edit-entity',
    'connect-user',
    'connect-user',
  ], userEntityActions, 'id'),

};

// ===================== SECTIONS =====================

export const connectionsSectionConfig: SectionConfig = {
  sectionFilters: [
  ],
  sectionKey: 'connections',
  tabs: [
    connectionsEntityConfig,
  ],
};
