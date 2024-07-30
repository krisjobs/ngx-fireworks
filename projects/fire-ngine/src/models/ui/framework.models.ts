import { QueryDocumentSnapshot } from "@angular/fire/firestore";
import { AbstractControl, ValidationErrors } from "@angular/forms";
import { QueryParamsHandling } from "@angular/router";
import { ConfigParams } from "..";
import { Entity } from "functions/src/styleguide/models";

// ! ALL COMPONENT CONFIG (VISIBLE) DEFINITIONS

// ===================== DEFINITIONS =====================

export type IconType = "outlined" | "filled" | "round";

export interface TabProperties {
  label: string;
  icon?: string;
  svgIcon?: boolean;

  disabled?: (params: Partial<ConfigParams>) => boolean;

  iconPosition?: 'before' | 'after';
};

export interface ChipConfig {
  text?: string;

  icon?: string;
  selected?: boolean;
  color?: string; // primary | accent | warn | undefined
};

export interface RouterMapping {
  sidenavLinks: NavigationLink[];
  url2heading: (url: string) => string;
};

export interface NavigationLink {
  title: string;
  targetUrl: string;
  icon?: string;
  hidden?: (params: Partial<ConfigParams>) => boolean;
  svgIcon?: boolean;
  outlined?: boolean;
  disabled?: boolean;
  classes?: string[];
  mergeQueryParams?: QueryParamsHandling;
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

export interface PaginatorSettings {
  querySize: number;
  pageSize: number;
  pageIndex: number;
  lastPageIndex: number | undefined;
  anchorHead: boolean | undefined;
  queryHead?: QueryDocumentSnapshot;
  queryTail?: QueryDocumentSnapshot;
};

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
