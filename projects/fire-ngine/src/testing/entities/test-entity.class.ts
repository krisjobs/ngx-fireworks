import { Entity } from "functions/src/styleguide/models";

export interface TestEntityConfig {
  id: string;
  type: string;
  collectionName: string;
  context: string;
}

export class TestEntity<E extends Entity = Entity, C extends TestEntityConfig = TestEntityConfig> {

  public static create<E extends Entity = Entity, C extends TestEntityConfig = TestEntityConfig>(
    config: C,
  ): TestEntity<E, C> | null {

    return null;
  }

  private data?: E;

  constructor(
    private config?: Partial<C>,
  ) {

  }

  /**
   * loads data from firestore
   */
  public read(): void {

  }

  public update(config: Partial<C>): void {

  }

  public delete(): void {

  }

  public checkGrid(): void {

  }

  public checkTable(): void {

  }

  public checkActions(): void {

  }

  public invokeAction(config: Partial<C>): void {

  }

  /**
   * verifies that the data in firestore matches the data property
   * @param config
   */
  public verifyData(data: E): void {

  }

  /**
   * checks various stats of a firebase collection
   */
  public checkDB(config: Partial<C>): void {

  }
}
