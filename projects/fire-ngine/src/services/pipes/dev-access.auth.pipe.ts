import { customClaims } from "@angular/fire/auth-guard";
import { pipe, map } from "rxjs";

import { UserCustomClaims, UserRole } from "../../common/models";


export const hasDevAccess = () => pipe(
  customClaims,
  map(claims => {
    const {
      roles
    } = claims as UserCustomClaims;

    return roles.includes(UserRole.ADMIN)
      || roles.includes(UserRole.EDITOR)
      || roles.includes(UserRole.SUPPORT);
  })
);
