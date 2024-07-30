import { AggregateField } from "@angular/fire/firestore";

export type FilterOp = '<' | '<=' | '==' | '!=' | '>=' | '>' | 'array-contains' | 'in' | 'array-contains-any' | 'not-in';
export type AggregateOp = 'sum' | 'avg' | 'count';
export type OrderDir = "asc" | "desc";

export type BasicType = number | string | boolean | null;
export type CompoundType = Array<BasicType> | Map<string, BasicType>;
export type ValueType = BasicType | CompoundType;

export type QueryScope = "collection" | "collectionGroup";
export type FieldIndexMode = "ascending" | "descending" | "arrays";

export type FilterGrouping = "and" | "or";

export interface QueryFilter {
  field: string;
  op: FilterOp;
  value: ValueType;
}

export interface QuerySort {
  field: string;
  direction: OrderDir;
}

export interface QueryAggregate {
  field: string;
  op: AggregateOp;
}

export interface AggregateResult {
  [field: string]: AggregateField<number>;
}

export interface FieldIndex {
  field: string;
  mode: FieldIndexMode;
}

export type QueryIndex = FieldIndex[];

export interface QueryConstraint {
  limit: number;
  limitToLast: number;

  // offset is for the next layer
  // startAt: number;
  // startAfter: number;
  // endAt: number;
  // endBefore: number;
}

export interface FilterGroup {
  filters: QueryFilter[];
}

export interface QueryConfig {
  collection: string;
  scope: QueryScope;
  grouping: FilterGrouping;
  groups?: FilterGroup[];
  sorts?: QuerySort[];
  aggregates?: QueryAggregate[];
  constraints?: Partial<QueryConstraint>;
}
