import { FirestoreQuery } from "./query.class";

describe('FirestoreQuery Tests', () => {
  let query: FirestoreQuery;

  beforeEach(() => {
    // Assuming FirestoreQuery is globally available or otherwise properly imported
    query = new FirestoreQuery('users');
  });

  it(`constructor initializes with default values`, () => {
    expect(query).to.exist;
    expect(query.config.collection).to.equal('users');
    expect(query.config.scope).to.equal('collection');
    expect(query.config.grouping).to.equal('and');
    expect(query.config.groups).to.be.undefined;
    expect(query.config.constraints).to.be.undefined;
    expect(query.numDisjunctions).to.equal(0);
  });

  it(`limit method sets a positive count correctly`, () => {
    query.limit(10);
    expect(query.config.constraints).to.deep.equal({ limit: 10 });
  });

  it(`limit method sets a count with reverse to true correctly`, () => {
    query.limit(10, true);
    expect(query.config.constraints).to.deep.equal({ limitToLast: 10 });
  });

  it(`where method should throw error when no filters are passed`, () => {
    expect(() => query.where()).to.throw("Cannot add an empty 'where' clause.");
  });

  it(`where method should add a single filter group with one non-array filter`, () => {
    expect(() => query
      .where({ field: 'num', op: '==', value: 10 })
    ).to.not.throw();
    expect(query.config.groups).to.have.length(1);
    expect(query.config.groups![0].filters).to.have.length(1);
    expect(query.numDisjunctions).to.equal(1);
  });

  it(`where method should add a single filter group with one 'in' filter`, () => {
    expect(() => query
      .where({ field: 'num', op: 'in', value: [1, 2, 3] })
    ).to.not.throw();
    expect(query.config.groups).to.have.length(1);
    expect(query.config.groups![0].filters).to.have.length(1);
    expect(query.numDisjunctions).to.equal(3);
  });

  it(`where method should add a single filter group with one 'array-contains-any' filter`, () => {
    expect(() => query
      .where({ field: 'str', op: 'array-contains-any', value: ['abc', 'xyz'] })
    ).to.not.throw();
    expect(query.config.groups).to.have.length(1);
    expect(query.config.groups![0].filters).to.have.length(1);
    expect(query.numDisjunctions).to.equal(2);
  });

  it(`'or' method should throw error when called before 'where'`, () => {
    expect(() => query
      .or({ field: 'name', op: '==', value: 'John' })
    ).to.throw("Cannot add 'or' filters without a 'where' clause.");
  });

  it(`'and' method should throw error when called before 'where'`, () => {
    expect(() => query
      .and({ field: 'name', op: '==', value: 'John' })
    ).to.throw("Cannot add 'and' filters without a 'where' clause.");
  });

  it(`'or' method should change grouping to 'and'`, () => {
    expect(() => query
      .where({ field: 'age', op: '>', value: 25 })
      .or({ field: 'name', op: '==', value: 'Alice' })
    ).to.not.throw();
    expect(query.config.grouping).to.equal('and');
    expect(query.config.groups).to.have.length(2);
  });

  it(`'and' method should change grouping to 'or'`, () => {
    expect(() => query
      .where({ field: 'age', op: '>', value: 25 })
      .and({ field: 'name', op: '==', value: 'Alice' })
    ).to.not.throw();
    expect(query.config.grouping).to.equal('or');
    expect(query.config.groups).to.have.length(2);
  });

  it(`should not chain 'and' method after grouping is set to 'and'`, () => {
    expect(() => query
      .where({ field: 'age', op: '>', value: 25 })
      .or({ field: 'name', op: '==', value: 'Alice' })
      .and({ field: 'country', op: '==', value: 'Wonderland' })
    ).to.throw("Cannot combine 'and' and 'or' groups in a single query.");
  });

  it(`should not chain 'or' method after grouping is set to 'or'`, () => {
    expect(() => query
      .where({ field: 'age', op: '>', value: 25 })
      .and({ field: 'name', op: '==', value: 'Alice' })
      .or({ field: 'country', op: '==', value: 'Wonderland' })
    ).to.throw("Cannot combine 'and' and 'or' groups in a single query.");
  });

  it(`'and' method should throw error when no filters are passed`, () => {
    expect(() => query
      .where({ field: 'age', op: '>', value: 25 })
      .and()
    ).to.throw("Cannot add an empty 'and' group.");
  });

  it(`'or' method should throw error when no filters are passed`, () => {
    expect(() => query
      .where({ field: 'age', op: '>', value: 25 })
      .or()
    ).to.throw("Cannot add an empty 'or' group.");
  });

  it(`should throw an error when adding a single 'in' filter with 31 values`, () => {
    const array = new Array(31).fill(0).map((_, index) => index);
    expect(() => query
      .where({ field: 'num', op: 'in', value: array })
    ).to.throw(`Cannot have more than ${query.MAX_NUM_DISJUNCTIONS} disjunctions in a single query (currently ${array.length}).`);
  });

  it(`should throw an error when adding a single 'array-contains-any' filter with 31 values`, () => {
    const array = new Array(31).fill(0).map((_, index) => index);
    expect(() => query
      .where({ field: 'num', op: 'array-contains-any', value: array })
    ).to.throw(`Cannot have more than ${query.MAX_NUM_DISJUNCTIONS} disjunctions in a single query (currently ${array.length}).`);
  });

  it(`should not throw an error when chaining 3*3 'and' groups`, () => {
    expect(() => query
      .where(
        { field: 'num', op: '==', value: 1 },
        { field: 'num', op: '==', value: 2 },
        { field: 'num', op: '==', value: 3 },
      ).and(
        { field: 'num', op: '==', value: 11 },
        { field: 'num', op: '==', value: 12 },
        { field: 'num', op: '==', value: 13 },
      ).and(
        { field: 'num', op: '==', value: 21 },
        { field: 'num', op: '==', value: 22 },
        { field: 'num', op: '==', value: 23 },
      )
    ).not.to.throw();
    expect(query.numDisjunctions).to.equal(27);
  });

  it(`should throw an error when chaining 3*4 'and' groups`, () => {
    expect(() => query
      .where(
        { field: 'num', op: '==', value: 1 },
        { field: 'num', op: '==', value: 2 },
        { field: 'num', op: '==', value: 3 },
        { field: 'num', op: '==', value: 4 },
      ).and(
        { field: 'num', op: '==', value: 11 },
        { field: 'num', op: '==', value: 12 },
        { field: 'num', op: '==', value: 13 },
        { field: 'num', op: '==', value: 14 },
      ).and(
        { field: 'num', op: '==', value: 21 },
        { field: 'num', op: '==', value: 22 },
        { field: 'num', op: '==', value: 23 },
        { field: 'num', op: '==', value: 24 },
      )
    ).to.throw(`Cannot have more than ${query.MAX_NUM_DISJUNCTIONS} disjunctions in a single query (currently 64).`);
  });

  it(`should calculate number of disjunctions when chaining diverse 'or' groups`, () => {
    expect(() => query
      .where(
        { field: 'num', op: 'in', value: [1, 2, 3, 4] },
      ).and(
        { field: 'num', op: 'array-contains-any', value: [5, 6] },
      ).and(
        { field: 'num', op: '==', value: 7 },
        { field: 'num', op: '==', value: 8 },
        { field: 'num', op: '==', value: 9 },
      )
    ).not.to.throw();
    expect(query.numDisjunctions).to.equal(24);
  });

  it(`should calculate number of disjunctions when chaining diverse 'and' groups`, () => {
    expect(() => query
      .where(
        { field: 'num', op: 'in', value: [1, 2, 3, 4] },
      ).or(
        { field: 'num', op: 'array-contains-any', value: [5, 6] },
      ).or(
        { field: 'num', op: '==', value: 7 },
        { field: 'num', op: '==', value: 8 },
        { field: 'num', op: '==', value: 9 },
      )
    ).not.to.throw();
    expect(query.numDisjunctions).to.equal(7);
  });

  it(`should calculate number of disjunctions when chaining diverse 'or' groups`, () => {
    expect(() => query
      .where(
        { field: 'num', op: 'in', value: [1, 2, 3] },
        { field: 'num', op: 'array-contains-any', value: [4, 5] },
        { field: 'num', op: '==', value: 6 },
      ).and(
        { field: 'num', op: 'in', value: [7, 8, 9] },
      ).and(
        { field: 'num', op: '==', value: 10 },
        { field: 'num', op: '==', value: 11 },
      )
    ).to.throw(`Cannot have more than ${query.MAX_NUM_DISJUNCTIONS} disjunctions in a single query (currently 36).`);
  });

  it(`should exceed number of disjunctions when chaining diverse 'and' groups`, () => {
    expect(() => query
      .where(
        // count as 3 disjunctions
        { field: 'num', op: 'array-contains-any', value: [31, 32, 33] },
      ).or(
        // counts as 1 disjunction
        { field: 'num', op: '==', value: 41 },
        { field: 'num', op: '<', value: 42 },
        { field: 'num', op: '>', value: 43 },
      ).or(
        // count as 30 disjunctions
        { field: 'num', op: 'in', value: [1, 2, 3, 4, 5, 6] },
        { field: 'num', op: 'in', value: [11, 12, 13, 14, 15] },
        { field: 'num', op: '==', value: 21 },
        { field: 'num', op: '>', value: 23 },
        { field: 'num', op: '<', value: 24 },
        // does not matter how many non-array filters are added
      )
    ).to.throw(`Cannot have more than ${query.MAX_NUM_DISJUNCTIONS} disjunctions in a single query (currently 34).`);
  });
});
