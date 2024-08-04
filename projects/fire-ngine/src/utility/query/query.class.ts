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


// protected querySettings2Constraints(settings?: QuerySettings): QueryConstraint[] {
//   if (!settings) {
//     return [];
//   }

//   let {
//     paginator: {
//       pageSize,
//       pageIndex,
//       lastPageIndex,
//       queryHead,
//       queryTail,
//       anchorHead,
//     },

//     filters,
//     tabFilters,
//     sectionFilters,
//     viewFilters,
//   } = settings;

//   filters = filters.concat(tabFilters, sectionFilters, Object.values(viewFilters));
//   // console.warn('FILTERS ->>>', viewFilters, Object.values(viewFilters))

//   const firstPage = !pageIndex;
//   const nextPage = pageIndex - lastPageIndex! === 1;
//   const previousPage = !firstPage && pageIndex - lastPageIndex! === -1;
//   const lastPage = pageIndex - lastPageIndex! === 2;

//   let constraints: QueryConstraint[] = [];

//   for (let filter of filters.filter(
//     f => f.equality === false && (f.value !== null || f.range !== null)
//   )) {
//     let {
//       value,
//       range,
//     } = filter;

//     if (!!value) {
//       // 1. string inequality filters
//       value = value as string;
//       const nextLetter = String.fromCharCode(value.charCodeAt(value.length - 1) + 1);
//       const nextWord = `${value.slice(0, -1)}${nextLetter}`;
//       constraints.push(orderBy(filter.property, 'asc'));
//       constraints.push(where(filter.property, '>=', value));
//       constraints.push(where(filter.property, '<', nextWord));
//     } else if (!!range) {
//       // 1.5 number inequality filters
//       const {
//         min,
//         max,
//         exclusive
//       } = range;

//       const gtOp = !exclusive ? '>=' : '>';
//       const ltOp = !exclusive ? '<=' : '<';

//       constraints.push(orderBy(filter.property, 'asc'));

//       if (min) {
//         constraints.push(where(filter.property, gtOp, min));
//       }

//       if (max) {
//         constraints.push(where(filter.property, ltOp, max));
//       }
//     }
//   }

//   // 2. equality filters
//   for (let filter of filters.filter(
//     f => (f.equality === true || f.equality === undefined) && f.value !== null
//   )) {
//     constraints.push(where(filter.property, '==', filter.value));
//   }

//   // 3. array operation filters
//   for (let filter of filters.filter(
//     f => f.equality === 'array' && f.value !== null
//   )) {
//     constraints.push(where(filter.property, 'array-contains', filter.value));
//   }

//   // 3.5 in operation filters
//   for (let filter of filters.filter(
//     f => f.equality === 'in' && f.value !== null
//   )) {
//     constraints.push(orderBy(documentId(), 'desc'));
//     constraints.push(where(
//       filter.property === 'id' ? documentId() : filter.property,
//       'in',
//       filter.value)
//     );
//   }

//   // 4. default orderBy in any case
//   if (!filters.find(filter => filter.property === 'id')) {
//     constraints.push(orderBy(settings.defaultOrderByField ?? 'stats.createdAt', 'desc'));
//   }

//   // 5. startAt/endAt and the like
//   if (lastPage) {
//     constraints.push(limitToLast(pageSize));
//   } else {
//     if (nextPage) {
//       // next page
//       if (queryTail) {
//         constraints.push(startAfter(queryTail));
//       }
//     } else if (previousPage) {
//       // previous page
//       if (queryHead) {
//         constraints.push(endBefore(queryHead));
//       }
//     } else if (firstPage) {

//     }

//     if (anchorHead) {
//       constraints.push(limit(pageSize));
//     } else {
//       constraints.push(limitToLast(pageSize));
//     }
//   }

//   console.warn(constraints)

//   return constraints;
// }
