import { User } from "functions/src/styleguide/models";
import { TestEntity, TestEntityConfig } from "./test-entity.class";

export interface TestUserConfig extends TestEntityConfig {

}

export class TestUser extends TestEntity<User, TestUserConfig> {

}
