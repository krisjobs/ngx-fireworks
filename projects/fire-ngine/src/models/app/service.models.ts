export enum LogLevel {
  DEBUG,
  INFO,
  WARN,
  ERROR,
}



export interface UrlParams {
  rawUrl: string;
  moduleName: string;
  rootType?: string;
  rootId?: string;
  nestedType?: string;
  nestedId?: string;
  queryType?: string;
  queryId?: string;
}

export interface UrlEntitiesContext {
  root?: Observable<Entity>;
  nested?: Observable<Entity>;
  query?: Observable<Entity>;
}

export interface UrlEntities {
  root: Entity | null;
  nested: Entity | null;
  query: Entity | null;
}
