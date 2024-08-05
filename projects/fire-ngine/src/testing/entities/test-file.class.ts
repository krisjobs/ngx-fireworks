import { EntityFile } from "functions/src/styleguide/models";
import { TestEntity, TestEntityConfig } from "./test-entity.class";

export interface TestFileConfig extends TestEntityConfig {


}

export class TestFile extends TestEntity<EntityFile, TestFileConfig> {

}
