import { AbstractControl, ValidationErrors } from "@angular/forms";

import { ConfigParams, EntityConfigParams } from "..";
import { Entity } from "../../common/models";


export type IconStyle = 'filled' | 'outlined';
export type Color = 'primary' | 'accent' | 'warn';

export interface IconConfig {
  name: string;
  style?: IconStyle;
}

export interface TabProps {
  label: string;
  disabled?: (params: Partial<ConfigParams>) => boolean;

  icon?: string;
  iconPosition?: 'before' | 'after';
};

export interface StepProps {
  label: string;
  sublabel: (entity: Entity) => string;

  color?: Color;
  icon?: string;

  preselectStrategy?: (params: Partial<EntityConfigParams>) => Entity;
  deselectStrategy?: (params: Partial<EntityConfigParams>) => boolean;
}

export interface ChipConfig {
  text?: string;

  icon?: string;
  selected?: boolean;
  color?: Color;
};

export interface SelectOption {
  name: string;
  value: string;
};

export interface AutocompleteGroup {
  label: string;
  options: SelectOption[];
};

export interface FormStep {
  name: string;
  title: string;
  fields: FormField[],
  invisible?: (params: Partial<ConfigParams>) => boolean; // should not be part of dialog form
};

export interface FormField {
  type: 'input' | 'select' | 'textarea' | 'date' | 'daterange' | 'switch' | 'dropzone' | 'chips';
  subtype?: string;
  label: string; // html
  name: string; // form control
  value: (params: Partial<ConfigParams>) => any; // entity value or defualt
  placeholder?: (params: Partial<ConfigParams>) => string; // html
  tooltip?: (params: Partial<ConfigParams>) => string;
  hint?: (params: Partial<ConfigParams>) => string;
  disabled?: (params: Partial<ConfigParams>) => boolean; // still shown in dialog form
  hidden?: (params: Partial<ConfigParams>) => boolean; // should not be part of dialog form
  options?: (params: Partial<ConfigParams>) => SelectOption[]; // type === select
  optionGroups?: (params: Partial<ConfigParams>) => AutocompleteGroup[]; // type === select
  expanded?: boolean; // type === dropzone

  /**
   * override dropzone file upload path
   */
  uploadPath?: (params: Partial<ConfigParams>) => string;
  uploadName?: (params: Partial<ConfigParams>) => string;
  validators?: (params: Partial<ConfigParams>) => ((control: AbstractControl) => ValidationErrors | null)[];
};

export interface ListItem {
  label: (params: Partial<ConfigParams>) => string;
  labelBold?: boolean;
  contentType: 'text' | 'input' | 'switch';
  content: (entity: any, old?: any) => any;
  contentName?: string; // form fields
  contentTarget?: string; // form fields
  contentNumeric?: boolean; // input fields
  contentPrefix?: (entity: any) => string; // form fields
  contentSuffix?: (entity: any) => string; // form fields
  contentTransform?: (value: any, entity?: any) => any;
  contentBold?: boolean; // text
  contentPlaceholder?: string; // form fields
  contentValidators?: (entity: any) => ((control: AbstractControl) => ValidationErrors | null)[]; // form fields
  contentStyle?: (entity: any) => any;
  hidden?: (entity: any, demo?: boolean) => boolean;
  inactive?: (entity: any) => boolean;
}

export interface TableColumn {
  columnDef: string;
  type: 'text' | 'icon' | 'number' | 'action';
  sortProperty: string;
  header?: string;
  headerIcon?: string;
  incrementAction?: string; // actionId
  decrementAction?: string; // actionId
  cell?: (params: Partial<ConfigParams>) => string | undefined; // value or actionId
  footer?: (data: any) => string;

  /**
   * hide whole columns from table
   */
  hidden?: (params: Partial<ConfigParams>) => boolean;

  /**
   * hide elements within a cell
   */
  invisible?: (params: Partial<ConfigParams>) => boolean;
};

export interface GridCard {
  title: (params: Partial<ConfigParams>) => string;
  subtitle: (params: Partial<ConfigParams>) => string | undefined;
  image: (params: Partial<ConfigParams>) => string;
  chips?: (params: Partial<ConfigParams>) => ChipConfig[];
};

export interface DashboardLayout {
  boxes: DashboardBox[];
};

export interface DashboardBox {
  boxId: string;
  type: 'header' | 'text' | 'media' | 'feature' | 'social';
  title?: string;
  widthBreakpoints?: number[];
  widthValues?: any[];
  breakpoints?: number[];
  breakpointValues?: any[];
  altBreakpoints?: number[];
  altBreakpointValues?: any[];
  withDivider?: boolean;
  styles?: any;
  segments: BoxSegment[];
};

export interface BoxSegment {
  title?: string;
  disabled?: boolean;
  link?: string;
  defaultUrl?: string;
  icon?: string;
  description?: string;
  altLinks?: string[];
  mediaUrls?: string[];
  altLabels?: string[];
  styles?: any;
  paragraphs?: string[];
};
