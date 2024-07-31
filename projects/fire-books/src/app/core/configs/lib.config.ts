import { LibConfig, ModuleConfig } from "../../../../../fire-ngine/src/models";
import { UserRole } from "../../../../../fire-ngine/src/common/models";

export const version = '0.0.1';

export const modules: ModuleConfig[] = [
  {
    routerLink: ['services'],
    displayName: 'Services'
  },
  {
    routerLink: ['news'],
    displayName: 'News'
  },
  {
    routerLink: ['articles'],
    displayName: 'Articles'
  },
  {
    routerLink: ['database'],
    displayName: 'Database'
  },
  {
    routerLink: ['calculator'],
    displayName: 'Calculator'
  },
  {
    routerLink: ['admin'],
    displayName: 'Admin',
    hiddenFromSidenav: ({
      userRoles = []
    }) => {
      return !userRoles.includes(UserRole.ADMIN);
    },
    hiddenFromHeader: () => true
  }
];

export const libConfig: LibConfig = {
  ports: {
    auth: 4302,
    firestore: 4303,
    storage: 4304,
    functions: 4305,
    pubsub: 4306,
  },
  version,
  modules
}
