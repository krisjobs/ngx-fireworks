import {
  defaultEntityActions, getDefaultEntitySettings,
  getDefaultQuerySettings, getDefaultViewSettings
} from "src/app/styleguide/modules/library/configs";
import { selectFromArray } from "src/app/styleguide/utility";
import { ConfigParams, EntityConfig, EntityFilter, RelatedConfigsMap, SectionConfig } from "src/app/styleguide";
import { fileFilterFields, linkFilterFields, mediaEntityFilters } from "./common/media-filters.config";
import { fileFormSteps, linkFormSteps } from "./common/media-forms.config";
import { fileGridCard } from "./common/media-grids.config";
import { fileTableColumns } from "./common/media-tables.config";
import { fileEntityActions, linkEntityActions } from "./common/media-actions.config";
import {
  dealershipsSectionConfig,
  manufacturersSectionConfig, marinasSectionConfig, mooringStaysSectionConfig,
  realYachtsSectionConfig, yachtConfigurationsSectionConfig, yachtEquipmentSectionConfig,
  yachtModelsSectionConfig, yachtOrdersSectionConfig
} from "src/app/shared/configs";


// ===================== ENTITIES =====================

export const filesEntityConfig: EntityConfig = {
  descriptor: 'file',
  firestorePath: 'media',
  displayName: 'file',
  icon: 'upload_file',
  tabProps: {
    label: 'Files',
    icon: 'upload_file',
    iconPosition: 'before',
  },
  // TODO also sort according to another array
  entitySettings: {
    ...getDefaultEntitySettings(),
  },
  viewSettings: getDefaultViewSettings({
    tableQuickActionId: 'download-file',
    cardQuickActionId: 'download-file',
    toolbarPinnedActionId: 'bulk-add',
  }),
  querySettings: getDefaultQuerySettings(
    selectFromArray([
      'type',
    ], mediaEntityFilters, 'name')),

  formSteps: fileFormSteps,
  filterFields: selectFromArray([
    'type',
  ], fileFilterFields, 'name'),

  gridCard: fileGridCard,
  tableColumns: selectFromArray([
    'name',
    'description',
    'type',
    'created',
    'updated',
    'uploader',
  ], fileTableColumns, 'columnDef'),

  viewActions: selectFromArray([
    'show-archived',
  ], fileEntityActions, 'id'),
  sortActions: selectFromArray([
    'most-recent',
  ], fileEntityActions, 'id'),

  collectionActions: selectFromArray([
    'bulk-add',
    'create-entity',
    'download-files',
  ], fileEntityActions, 'id'),
  documentActions: selectFromArray([
    'download-file',
    'set-thumbnail',
    'edit-entity',
    'copy-entity',
    'remove-entity',
  ], fileEntityActions, 'id'),
  finalFilters: () => {
    const finalFilters = {} as { [filterId: string]: EntityFilter };

    finalFilters['isFile'] = {
      name: 'isFile',
      property: 'attributes.type',
      value: 'file'
    };

    return finalFilters;
  },
};

export const linksEntityConfig: EntityConfig = {
  descriptor: 'link',
  firestorePath: 'media',
  displayName: 'link',
  icon: 'link',
  tabProps: {
    label: 'Links',
    icon: 'link',
    iconPosition: 'before',
  },
  // TODO also sort according to another array
  entitySettings: {
    ...getDefaultEntitySettings(),
  },
  viewSettings: getDefaultViewSettings({
    tableQuickActionId: 'edit-entity',
    cardQuickActionId: 'edit-entity',
    toolbarPinnedActionId: 'create-entity',
  }),
  querySettings: getDefaultQuerySettings(
    selectFromArray([
      'type',
    ], mediaEntityFilters, 'name')),

  formSteps: linkFormSteps,
  filterFields: selectFromArray([
    'type',
  ], linkFilterFields, 'name'),

  gridCard: fileGridCard,
  tableColumns: selectFromArray([
    'name',
    'description',
    'type',
  ], fileTableColumns, 'columnDef'),

  viewActions: selectFromArray([
    'show-archived',
  ], defaultEntityActions, 'id'),
  sortActions: selectFromArray([
    'most-recent',
  ], defaultEntityActions, 'id'),

  collectionActions: selectFromArray([
    'create-entity',
  ], defaultEntityActions, 'id'),
  documentActions: selectFromArray([
    'open-link',
    'edit-entity',
    'copy-entity',
    'remove-entity',
  ], linkEntityActions, 'id'),
  finalFilters: () => {
    const finalFilters = {} as { [filterId: string]: EntityFilter };

    finalFilters['isLink'] = {
      name: 'isLink',
      property: 'attributes.type',
      value: 'link'
    };

    return finalFilters;
  },
};

const mediaRelatedConfigsMap: RelatedConfigsMap = {
  equipment: {
    config: yachtEquipmentSectionConfig,
    entityIdx: 0,
    firestorePathOverride: ({
      url
    }: Partial<ConfigParams>) => {
      const {
        rootId, // equipmentId,
        rootType, // 'equipment',
        queryType, // boat type
        queryId, // queryId
      } = url!;


      return queryType ? `boats/${queryId}/equipment` : 'equipment';
    }
  },
  models: {
    config: yachtModelsSectionConfig,
    entityIdx: 0,
  },
  model: {
    config: yachtModelsSectionConfig,
    entityIdx: 0,
  },
  config: {
    config: yachtConfigurationsSectionConfig,
    entityIdx: 0,
  },
  configurations: {
    config: yachtConfigurationsSectionConfig,
    entityIdx: 0,
  },
  order: {
    config: yachtOrdersSectionConfig,
    entityIdx: 0,
  },
  orders: {
    config: yachtOrdersSectionConfig,
    entityIdx: 0,
  },
  real: {
    config: realYachtsSectionConfig,
    entityIdx: 0,
  },
  marinas: {
    config: marinasSectionConfig,
    entityIdx: 0,
  },
  manufacturers: {
    config: manufacturersSectionConfig,
    entityIdx: 0,
  },
  dealerships: {
    config: dealershipsSectionConfig,
    entityIdx: 0,
  },
  stays: {
    config: mooringStaysSectionConfig,
    entityIdx: 0,
  },
};

export const mediaSectionConfig: SectionConfig = {
  sectionKey: 'media',
  tabs: [
    filesEntityConfig,
    linksEntityConfig,
  ],
  related: mediaRelatedConfigsMap,
};






import { EntityAction } from "src/app/styleguide";
import { defaultEntityActions } from "../../../library/configs";
import { EntityFile } from "functions/src/styleguide/models";

export const fileEntityActions: EntityAction[] = [
  ...defaultEntityActions,
  // * doc -> set-thumbnail
  {
    id: 'set-thumbnail',
    states: {
      ['default']: {
        value: () => 'recent_actors',
        label: () => `Set thumbnail`,
      }
    },

    disabled: ({ entity, context }) => (entity as EntityFile).information.fileUrl === context?.nested?.media.defaultUrl,
    color: ({ entity, context }) => (context?.nested ?? context?.root)?.media.defaultUrl === (entity as EntityFile).information.fileUrl ? 'primary' : null!,
    type: () => 'icon',
  },
  {
    id: 'bulk-add',
    states: {
      ['default']: {
        value: () => 'burst_mode',
        label: () => `Bulk add files`,
      }
    },
    type: () => 'icon',
  },
  // * doc -> download-file
  {
    id: 'download-file',
    states: {
      ['default']: {
        value: () => 'download',
        label: () => `Download file`,
      }
    },
    type: () => 'icon',
  },
];

export const linkEntityActions: EntityAction[] = [
  ...defaultEntityActions,
  {
    id: 'open-link',
    states: {
      ['default']: {
        value: () => 'send',
        label: () => `Open link`,
      }
    },
    type: () => 'icon',
  },
];




import { EntityFilter, FormField } from "src/app/styleguide";
import { defaultEntityFilters, defaultFilterFields } from "../../../library/configs";
import { getEnumOptions } from "src/app/styleguide/utility";
import { FileType, LinkType } from "functions/src/styleguide/models";

export const mediaEntityFilters: EntityFilter[] = [
  ...defaultEntityFilters,
  // * type
  {
    name: 'type',
    value: null,
    property: 'attributes.type',
    equality: true,
  },
];

export const fileFilterFields: FormField[] = [
  ...defaultFilterFields,
  // * type
  {
    name: 'type',
    label: 'File type',
    type: 'select',
    value: () => null,
    options: () => getEnumOptions(FileType),
  },
];

export const linkFilterFields: FormField[] = [
  ...defaultFilterFields,
  // * type
  {
    name: 'type',
    label: 'Link type',
    type: 'select',
    value: () => null,
    options: () => getEnumOptions(LinkType),
  },
];




import { Validators } from "@angular/forms";
import { defaultFormSteps } from "../../../library/configs";
import { FormStep } from "src/app/styleguide";
import { EntityFile, EntityLink } from "functions/src/styleguide/models";
import { MediaEntity } from "functions/src/styleguide/models/library/media.models";

export const fileFormSteps: FormStep[] = [
  // * information
  {
    name: 'information',
    title: 'Basic information',
    fields: [
      // * information
      {
        name: 'name',
        label: 'Name',
        type: 'input',
        value: ({
          entity
        }) => {
          const media = entity as MediaEntity;

          return media.information?.name;
        },
        validators: () => [
          Validators.required
        ]
      },
      // * description
      defaultFormSteps[0].fields[1],
      // * fileUrl
      {
        name: 'fileUrl',
        label: 'File url',
        type: 'dropzone',
        expanded: true,
        value: ({
          entity
        }) => {
          const file = entity as EntityFile;

          return file.information?.fileUrl ?? null;
        },
        uploadPath: ({
          url
        }) => {
          const {
            rootType,
            rootId,
          } = url!;

          return `images/${rootType}/${rootId}/files`
        },
        validators: () => [
          Validators.required
        ]
      },
      // * notes
      defaultFormSteps[0].fields[2],
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
        expanded: true,
        value: ({
          entity
        }) => entity!.media?.defaultUrl ??
          'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9c/Generic_File_OneDrive_icon.svg/640px-Generic_File_OneDrive_icon.svg.png',
        validators: () => [
          Validators.required
        ]
      },
      // * alternativeFile
      {
        name: 'alternativeFile',
        label: 'alternativeFile',
        type: 'dropzone',
        value: ({
          entity
        }) => {
          const file = entity as EntityFile;

          return file.media?.alternativeFile ?? null;
        },
        expanded: false,
        validators: () => [
        ]
      },
      // * backupFile
      {
        name: 'backupFile',
        label: 'backupFile',
        type: 'dropzone',
        value: ({
          entity
        }) => {
          const file = entity as EntityFile;

          return file.media?.backupFile ?? null;
        },
        expanded: false,
        validators: () => [
        ]
      },
    ]
  },
];

export const linkFormSteps: FormStep[] = [
  // * information
  {
    name: 'information',
    title: 'Basic information',
    fields: [
      // * information
      {
        name: 'name',
        label: 'Name',
        type: 'input',
        value: ({
          entity
        }) => {
          const file = entity as EntityFile;

          return file.information?.name;
        },
        validators: () => [
          Validators.required
        ]
      },
      // * linkUrl
      {
        name: 'linkUrl',
        label: 'Link url',
        type: 'input',
        value: ({
          entity
        }) => {
          const link = entity as EntityLink;

          return link.information?.linkUrl ?? null;
        },
        validators: () => [
          Validators.required
        ]
      },
      // * description
      defaultFormSteps[0].fields[1],
      // * notes
      defaultFormSteps[0].fields[2],
    ]
  },
];



import { GridCard } from "src/app/styleguide";
import * as dayjs from "dayjs";

export const fileGridCard: GridCard = {
  title: ({
    entity
  }) => entity!.information.name,
  subtitle: ({
    entity
  }) => `Created on: ${dayjs(entity!.stats.createdAt.toDate()).format('DD/MM/YY')}`,
  image: ({
    entity
  }) => entity!.media.defaultUrl ?? '',
  chips: () => [],
};



import { TableColumn } from "src/app/styleguide";
import { FileType, EntityFile, LinkType, EntityLink } from "functions/src/styleguide/models";
import * as dayjs from "dayjs";
import { getDisplayName } from "src/app/styleguide/utility";

export const mediaTableColumns: TableColumn[] = [
  // * description
  {
    columnDef: 'description',
    sortProperty: 'information.description',
    type: 'text',
    header: 'Description',
    cell: ({
      entity
    }) => {
      const file = entity as EntityFile;

      return file.information.description;
    },
  },
];

export const fileTableColumns: TableColumn[] = [
  // * name
  {
    columnDef: 'name',
    sortProperty: 'information.name',
    type: 'text',
    header: 'File name',
    cell: ({
      entity
    }) => {
      const file = entity as EntityFile;

      return file.information.name;
    },
  },
  ...mediaTableColumns,
  // * type
  {
    columnDef: 'type',
    sortProperty: 'attributes.type',
    type: 'text',
    header: 'File type',
    cell: ({
      entity
    }) => {
      const file = entity as EntityFile;

      return getDisplayName(FileType, file.attributes.type);
    },
  },
  // * created
  {
    columnDef: 'created',
    sortProperty: 'stats.createdAt',
    type: 'text',
    header: 'Created',
    cell: ({
      entity
    }) => dayjs(entity!.stats.createdAt.toDate()).format('DD/MM/YY'),
  },
  // * updated
  {
    columnDef: 'updated',
    sortProperty: 'stats.updated',
    type: 'text',
    header: 'Updated',
    cell: ({
      entity
    }) => dayjs(entity!.stats.updatedAt.toDate()).format('DD/MM/YY'),
  },
  // * uploader
  {
    columnDef: 'uploader',
    sortProperty: 'data.uploaderName',
    type: 'text',
    header: 'Uploaded by',
    cell: ({
      entity
    }) => (entity as EntityFile).data.uploaderName,
  },
];

export const linkTableColumns: TableColumn[] = [
  // * name
  {
    columnDef: 'name',
    sortProperty: 'information.name',
    type: 'text',
    header: 'Link name',
    cell: ({
      entity
    }) => {
      const file = entity as EntityFile;

      return file.information.name;
    },
  },
  ...mediaTableColumns,
  // * type
  {
    columnDef: 'type',
    sortProperty: 'attributes.type',
    type: 'text',
    header: 'Link type',
    cell: ({
      entity
    }) => {
      const link = entity as EntityLink;

      return getDisplayName(LinkType, link.attributes.type);
    },
  },
];




