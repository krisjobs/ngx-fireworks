import { User } from "@angular/fire/auth";
import { Observable } from "rxjs";

import { Entity, EntityAttributes } from "../../common/models";
import { ConfigParams, QueryFilter, FormStep, ListItem, SectionConfig } from "..";


export interface SaveModalData {

  entity: Entity;
  operation: 'create' | 'copy' | 'update';
  title: string;

  newId?: string;
  targetPath?: string;


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

export interface RemoveModalData {
  markedForDelete?: boolean;
}

export interface ListPanelData {
  entity: Entity;
  items: ListItem[][];
  demoMode?: boolean;
  withButton?: boolean;
  buttonText?: string;
  closeOnSave?: boolean;
  buttonDisabled?: (entity: any) => boolean,
};

export interface ActionPanelData {
  entity: Entity;
}
