import { User } from "@angular/fire/auth";
import { Observable } from "rxjs";

import { Entity, EntityAttributes } from "../../common/models";
import { ConfigParams, EntityFilter, FormStep, ListItem, SectionConfig, UrlEntities, UrlParams } from "..";


export type CrudOperation = 'create' | 'update' | 'delete';

export interface TemplatesConfigData {
  templateCollections?: string[];
  templateStageNames?: string[];
  templateStepLabels?: string[];
  templateStepIcons?: string[];
  templateStepColors?: string[];
  entitiesDisplay?: ((entity: any) => string)[];
  preselectStrategy?: (user: User, templates: Entity[], related?: any, entities?: any) => (Entity | undefined)[];
  entityAssembly?: (entities: any, initial: any, current: any) => Entity;
  entitiesCancel?: (oldEntities: any, newEntities: any) => (Entity | null)[];
  viewFilters?: <T extends Entity>(params: Partial<ConfigParams<T>>) => Record<string, EntityFilter>[];
}

// ===================== MAIN =====================

export interface ModalData {
  entity: Partial<Entity>;
  context: UrlEntities;
  url: UrlParams;
  /**
   * used with templates to preselect parent
   * steps where parent.id can be used to preselect the entity
   */
  parentContextIdx?: number;

  /**
   * used with templates to send data to form
   * specifies idx of template collection which to use as input
   */
  formContextIdx?: number;

  steps: FormStep[];
  operation: CrudOperation;
  newId?: string;
  title: string;
  targetPath?: string;

  /**
   * changes generateRawEntity to set
   * attributes.type to sectionConfig.key and
   * attributes.class to entityConfig.descriptor
   */
  sectionAsType?: boolean;

  markedForDelete?: boolean;

  /**
   * Used to show templates tables independent from entity settings
   */
  hideTemplates?: boolean;

  /**
   * Used to show templates tables independent from url
   */
  showTemplates?: boolean;

  selectedFormIdx?: number;
  selectedStepIdx?: number;
  templatesConfig?: TemplatesConfigData;
  subcollections?: string[];
  saveButtonText?: string; // override default save button text
  copySubcollectionAttributes?: <T extends Entity>(params: Partial<ConfigParams<T>>) => EntityAttributes;

  /**
   * override default firestore path generation strategy
   *
   * especially useful for files
   */
  pathOverride?: string;

  config?: [SectionConfig, number];
  onRequest?: (data: any) => any;
  onResponse?: (data?: any) => void;
  customRequest$?: (data: any, dialogData: ModalData) => Observable<any>
};

export interface PanelData {
  entity: Entity;
  items: ListItem[][];
  demoMode?: boolean;
  withButton?: boolean;
  buttonText?: string;
  closeOnSave?: boolean;
  buttonDisabled?: (entity: any) => boolean,
};
