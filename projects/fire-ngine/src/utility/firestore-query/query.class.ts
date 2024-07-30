import {
  BasicType,
  QueryScope,
  OrderDir,
  QueryFilter,
  FilterGroup,
  QueryIndex,
  QueryConfig,
  AggregateOp
} from "./query.models";

import {
  FirestoreQueryCore
} from "./query-core.class";


// TODO - implement multi-field inequality filters

export class FirestoreQuery extends FirestoreQueryCore {

  public readonly MAX_NUM_DISJUNCTIONS = 30;

  // order of __name__ field
  private defaultOrder: OrderDir = "asc";

  public numDisjunctions: number = 0;

  constructor(
    collection: string,
    scope: QueryScope = "collection"
  ) {
    const config: QueryConfig = {
      collection,
      scope,
      grouping: "and",
    };

    super(config);
  }

  public where(...filters: QueryFilter[]): FirestoreQuery {
    const group: FilterGroup = {
      filters
    };

    if (filters.length === 0) {
      throw new Error("Cannot add an empty 'where' clause.");
    }

    this.config.groups = [group];
    this.checkDisjunctions();

    return this;
  }

  /**
   * chains an AND combined filters group to the other OR combined filter groups
   */
  public or(...filters: QueryFilter[]): FirestoreQuery {
    if (!this.config.groups || this.config.groups.length === 0) {
      throw new Error("Cannot add 'or' filters without a 'where' clause.");
    }

    if (this.config.groups.length > 1 && this.config.grouping === "or") {
      throw new Error("Cannot combine 'and' and 'or' groups in a single query.");
    }

    if (filters.length === 0) {
      throw new Error("Cannot add an empty 'or' group.");
    }

    const group: FilterGroup = {
      filters
    };

    this.config.groups.push(group);
    this.checkDisjunctions();

    return this;
  }

  /**
   * chains an OR combined filters group to the other AND combined filter groups
   */
  public and(...filters: QueryFilter[]): FirestoreQuery {
    if (!this.config.groups || this.config.groups.length === 0) {
      throw new Error("Cannot add 'and' filters without a 'where' clause.");
    }

    if (this.config.groups.length > 1 && this.config.grouping === "and") {
      throw new Error("Cannot combine 'and' and 'or' groups in a single query.");
    }

    if (filters.length === 0) {
      throw new Error("Cannot add an empty 'and' group.");
    }

    if (this.config.groups.length === 1) {
      this.config.grouping = "or";
    }

    const group: FilterGroup = {
      filters
    };

    this.config.groups.push(group);
    this.checkDisjunctions();

    return this;
  }

  public orderBy(field: string, direction: OrderDir = 'asc'): FirestoreQuery {
    if (!this.config.sorts) {
      this.config.sorts = [];
    }

    this.config.sorts.push({
      field,
      direction
    });

    return this;
  }

  public aggregate(field: string, op: AggregateOp): FirestoreQuery {
    if (!this.config.aggregates) {
      this.config.aggregates = [];
    }

    if (op === "count" && this.config.aggregates.find(agg => agg.op === "count")) {
      throw new Error("Cannot have more than one 'count' aggregate in a single query.");
    }

    this.config.aggregates.push({
      field,
      op
    });

    return this;
  }

  // TODO - implement index evaluation logic
  public evaluateQueryIndexes(): QueryIndex[] {
    if (!this.config.groups &&
      !this.config.sorts &&
      !this.config.aggregates) {
      return [];
    }

    throw new Error("Not implemented.");
  }

  public limit(count: number, reverse: boolean = false): FirestoreQuery {
    if (!this.config.constraints) {
      this.config.constraints = {};
    }

    if (reverse) {
      this.config.constraints.limitToLast = count;
    } else {
      this.config.constraints.limit = count;
    }

    return this;
  }

  private checkDisjunctions() {
    if (!this.config.groups) {
      throw new Error("No filter groups found.");
    }

    if (this.config.grouping === "or") {
      this.numDisjunctions = 1;

      for (let group of this.config.groups) {
        const multipliers = [];

        for (const filter of group.filters) {
          if (filter.op === "in" || filter.op === "array-contains-any") {
            multipliers.push((filter.value as Array<BasicType>).length);
          } else {
            multipliers.push(1);
          }
        }

        const disjunctionMultiplier = multipliers.reduce((acc, val) => acc + val, 0);
        this.numDisjunctions *= disjunctionMultiplier;
      }
    } else if (this.config.grouping === "and") {
      this.numDisjunctions = 0;

      for (let group of this.config.groups) {
        const multipliers = [];

        for (const filter of group.filters) {

          if (filter.op === "in" || filter.op === "array-contains-any") {
            multipliers.push((filter.value as Array<BasicType>).length);
          }
        }

        const numDisjunctions = multipliers.reduce((acc, val) => acc * val, 1);
        this.numDisjunctions += Math.max(numDisjunctions, 1);
      }
    } else {
      throw new Error("Invalid grouping type.");
    }

    if (this.numDisjunctions > this.MAX_NUM_DISJUNCTIONS) {
      throw new Error(`Cannot have more than ${this.MAX_NUM_DISJUNCTIONS} disjunctions in a single query (currently ${this.numDisjunctions}).`);
    }
  }
}
