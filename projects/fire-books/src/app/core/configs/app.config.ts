import { AppConfig, ModuleConfig } from "../../../../../fire-ngine/src/models";
import { UserRole } from "../../../../../fire-ngine/src/common/models";

export const version = '0.0.1';

export const modules: ModuleConfig[] = [
  {
    urlSegment: 'books',
    sectionIds: [],
    displayName: 'Books'
  },
  {
    urlSegment: 'lunch',
    sectionIds: [],
    displayName: 'Lunch'
  },
  {
    urlSegment: 'chess',
    sectionIds: [],
    displayName: 'Chess'
  },
  {
    urlSegment: 'fitness',
    sectionIds: [],
    displayName: 'Fitness'
  },
  {
    urlSegment: 'admin',
    sectionIds: [],
    displayName: 'Admin',
    hiddenFromSidenav: ({
      userRoles = []
    }) => {
      return !userRoles.includes(UserRole.ADMIN);
    },
    hiddenFromHeader: () => true
  }
];

export const appConfig: AppConfig = {
  ports: {
    auth: 4302,
    firestore: 4303,
    storage: 4304,
    functions: 4305,
    pubsub: 4306,
  },
  version,
  modules,
  entities: {},
  sections: {}
}
