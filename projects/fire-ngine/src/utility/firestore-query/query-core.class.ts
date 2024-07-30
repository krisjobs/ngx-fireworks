import {
  and,
  or,
  collection,
  Firestore,
  query,
  where,
  orderBy,
  limit,
  limitToLast,
  Query,
  FirestoreDataConverter,
  QueryFieldFilterConstraint,
  QueryCompositeFilterConstraint,
  QueryNonFilterConstraint,
  collectionGroup,
  getAggregateFromServer,
  QueryOrderByConstraint,
  count,
  sum,
  average,
} from '@angular/fire/firestore';

import {
  AggregateResult,
  QueryConfig,
  QueryScope,
} from "./query.models";


export abstract class FirestoreQueryCore {
  public config: QueryConfig;

  constructor(
    config: QueryConfig
  ) {
    this.config = config;
  }

  public generateQuery<T>(
    firestore: Firestore,
    converter: FirestoreDataConverter<T>,
    scope: QueryScope = "collection"
  ): Query<T> {
    const colRef = scope === 'collection' ?
      collection(firestore, this.config.collection)
      : collectionGroup(firestore, this.config.collection);

    const queryFilters = this.getFilters();
    const querySorts = this.getSorts();
    const queryConstraints = this.getConstraints();

    let queryRef: Query;

    if (queryFilters instanceof QueryCompositeFilterConstraint) {
      queryRef = query(
        colRef,
        queryFilters,
        ...querySorts,
        ...queryConstraints,
      );
    } else {
      queryRef = query(
        colRef,
        ...queryFilters,
        ...querySorts,
        ...queryConstraints,
      );
    }

    return queryRef.withConverter(converter);
  }

  public async getAggregate<T, Q>(
    firestore: Firestore,
    converter: FirestoreDataConverter<T>,
    scope: QueryScope = "collection"
  ): Promise<Q> {
    if (!this.config.aggregates) {
      throw new Error("No aggregates specified in query config.");
    }

    const query = this.generateQuery<T>(firestore, converter, scope);

    const aggregates = this.config.aggregates;

    const aggregate = await getAggregateFromServer(
      query,
      {
        ...aggregates.reduce((acc, agg) => ({
          ...acc,
          [`${agg.op}$${agg.field}`]: agg.op === "count" ?
            count() :
            (agg.op === "sum" ?
              sum(agg.field) :
              average(agg.field)
            )
        }), {} as AggregateResult)
      }
    ).then((snapshot) => snapshot.data() as Q);

    return aggregate;
  }

  private getFilters(): QueryFieldFilterConstraint[] | QueryCompositeFilterConstraint {
    if (!this.config.groups || this.config.groups.length === 0) {
      return [];
    }

    if (this.config.groups.length === 1) {
      const filters = this.config.groups[0].filters;

      return filters.map(filter => where(filter.field, filter.op, filter.value));
    } else {
      if (this.config.grouping === "and") {
        return or(
          ...this.config.groups.map(group =>
            and(
              ...group.filters.map(filter => where(filter.field, filter.op, filter.value))
            )
          )
        );
      } else {
        // this.config.grouping === "or"
        return and(
          ...this.config.groups.map(group =>
            or(
              ...group.filters.map(filter => where(filter.field, filter.op, filter.value))
            )
          )
        );
      }
    }
  }

  private getSorts(): QueryOrderByConstraint[] {
    if (!this.config.sorts) {
      return [];
    }

    const sorts = this.config.sorts;

    return sorts.map(sort => orderBy(sort.field, sort.direction));
  }

  private getConstraints(): QueryNonFilterConstraint[] {
    if (!this.config.constraints) {
      return [];
    }

    const constraints = this.config.constraints;

    return [
      ...(constraints.limit ? [limit(constraints.limit)] : []),
      ...(constraints.limitToLast ? [limitToLast(constraints.limitToLast)] : []),
    ];
  }
}
