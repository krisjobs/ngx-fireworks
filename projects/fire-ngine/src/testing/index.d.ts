import { Entity } from "../../functions/src/styleguide/models";

export { };

export declare interface DataOptions {
  /**
   * selector used with cy.get
   */
  cyData: string;

  /**
   * value to insert into cy.get-element
   */
  insertValue: string | number | boolean;

  /**
   * data attribute to get TS content on the frontend, e.g. actionId
   */
  testData: string;

  /**
   * text contained within selected element
   */
  containsText: string;

  /**
   * used for checking the selected input's value
   */
  containsValue: string;

  /**
   * for the case of multiple cy.get query results
   */
  targetCount: number;

  /**
   * check if an old value has been incremented properly
   *
   * requires tight cooperation with sessionStorage
   */
  targetIncrement: number;

  /**
   * applies a specific context to the given command
   */
  viewType: ViewType;

  /**
   * click the element at a specific position
   */
  clickPosition: 'topLeft' | 'top' | 'topRight' | 'left' | 'center' | 'right' | 'bottomLeft' | 'bottom' | 'bottomRight';

  /**
   * check if button or similar is disabled
   */
  isDisabled: boolean;

  /**
   * check if an input is invalid
   */
  isInvalid: boolean;

  /**
   * check if a switch or similar is checked
   */
  isChecked: boolean;

  /**
   * click on expansion panel header to show content if hidden by default
   */
  expandPanel: boolean;

  /**
   * get a particular property out of an element
   *
   * OR use this identifier to store an information in sessionStorage
   */
  propertyName: string;
}

export declare interface NavigationOptions {
  moduleId: string;
  sectionId: string;
  tabIdx: number;
  targetUrl: string;
}

export declare interface FirebaseOptions {
  /**
   * path to firestore collection
   * * must have uneven number of segments
   */
  colPath: string;

  /**
   * path to firebase storage folder
   */
  filePath: string;

  /**
   * name of file stored in firebase storage
   */
  fileName: string;

  /**
   * id of a firestore document
   */
  docId: string;

  /**
   * id of target document
   */
  targetId: string;

  /**
   * list of all possible CRUD operations
   */
  operation: TestOp;

  /**
   * allows you to use different operation, outside of the all possible CRUD operations
   */
  customOperation: string;

  /**
   * in case of multiple documents get map instead of list
   */
  asMap: boolean;

  /**
   * store data we got from the DB in session storage for later use
   */
  storeAs: string;

  /**
   * a function that compares a document to a document stored in the DB
   */
  equalityFn: (dbDoc: any, targetDoc: any) => void;

  /**
   * a function that is used to filter a list of db documents directly
   */
  queryFilter: (dbDoc: any) => boolean;
}

export declare interface MenuOptions {
  /**
   * Open the appropriate menu corresponding to the actions type
   */
  actionsType: ActionsType;

  /**
   * A complete list of all actions that should be displayed
   */
  actionsList: TestAction[];

  /**
   * A particular action to be called by id, used with invokeAction
   */
  action?: TestAction;

  /**
   * In the case of document actions
   */
  entityId?: string;

  /**
   * In the case we want to explicitly switch to a particular view
   */
  viewType?: ViewType;
}

export declare interface FormOptions {
  /**
   * list of all possible CRUD operations
   */
  operation: TestOp;

  /**
   * allows you to use different operation, outside of the all possible CRUD operations
   */
  customOperation: string;

  /**
   * modify and fill out form if available (create/edit)
   */
  steps: FormStep[];

  /**
   * used to check data in db
   */
  colPath: string;

  /**
   * a function that is used to filter a list of db documents directly
   * * used with checkCollection
   */
  queryFilter: (dbDoc: any) => boolean;
}

export declare type FormStep = {
  name: string;
  fields: FormField[];
};

export declare type TableRow = {
  columnDef: string;
  content: (entity: any) => string | undefined;
}

export declare type GridCard = {

}

export declare type FormField = {
  /**
   * used to build cyData
   */
  name: string;

  /**
   * type of form field
   */
  type: FieldType;

  /**
   * = testData, empty value is "null"
   */
  data?: string;

  /**
   * value to input/select
   *
   * for dates use YYYY-MM-DD
   */
  value?: string | number | boolean;

  /**
   * just check current value
   */
  target?: string | number | boolean;

  /**
   * check if the save button is disabled or not
   */
  formValid?: boolean;

  /**
   * check if an input/date/text field is invalid after input
   */
  fieldInvalid?: boolean;

  /**
   * check if a field is disabled
   */
  fieldDisabled?: boolean

  /**
   * true if content is hidden under an expansion panel
   */
  expand?: boolean;
};

export declare interface EntityOptions {
  /**
   * entity to be used in save dialog
   */
  entity: Partial<Entity>;

  /**
   * id of entity to be copied
   */
  entityId: string;

  /**
   * list of all possible CRUD operations
   */
  operation: TestOp;

  /**
   * allows you to use different operation, outside of the all possible CRUD operations
   */
  customOperation: string;

  /**
   * a tag that can be used to cover different use cases
   */
  operationContext?: string;

  /**
   * skips inputting any changes in the form
   */
  skipChanges: boolean;

  /**
   * skips checking number of elements displayed on the FE (dialog template mode)
   */
  skipQueryCheck: boolean;

  /**
   * explicitly switch to last form stage -> form itself
   */
  switchToForm: boolean;

  /**
   * check the count of the entities already on the view before the operation
   * - for yachts: defaults to the number of documents in the DB, filtered by attributes.type
   */
  querySizeBefore: number;

  /**
   * check the count of the entities already on the view after the operation
   * - for yachts: defaults to querySizeBefore + 1
   */
  querySizeAfter: number;

  /**
   * path to firestore collection
   */
  colPath: string;

  /**
   * check table columns
   */
  tableColumns: TableRow[];

  /**
   * check grid card
   */
  gridCard: GridCard;
}

declare type TestOp = 'create' | 'edit' | 'copy' | 'archive' | 'unarchive' | 'delete';
declare type FieldType = 'input' | 'select' | 'text' | 'switch' | 'date' | 'file';
declare type FilterType = 'input' | 'select';
declare type ViewType = 'grid' | 'table';
declare type SortingType = 'descending' | 'ascending' | 'neutral';
declare type ActionsType = 'collection' | 'document' | 'view' | 'sort';

declare type TestAction = {
  actionId: string;
  actionState?: string;
  shouldExist?: boolean;
};

declare type TestFilter = {
  name: string;
  type: FilterType;
  value: any;
};
