import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, RouterStateSnapshot } from "@angular/router";
import { Observable, tap } from "rxjs";

// ===================== MODELS =====================

import { Entity } from "functions/src/styleguide/models";

// ===================== UTILITY =====================

import { getParamsFromUrl } from "src/app/styleguide/utility";

// ===================== SERVICES =====================

import { AppService } from "src/app/styleguide/services/app.service";
import { AuthService } from "../../firebase/services/auth.service";
import { NotificationService } from "src/app/styleguide/services/notification.service";
import { EntityRepository } from "../../library/services/entity.repository";

// ===================== DEFINITIONS =====================

@Injectable()
export class UserResolver {

  constructor(
    private appService: AppService,
    private authService: AuthService,
    private entityRepository: EntityRepository,
    private notificationService: NotificationService,
  ) { }

  resolve(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Promise<[Observable<Entity>?, Observable<Entity>?]> {
    if (!this.authService.currentUser) {
      const message = 'You are not authorozied for this operation';
      this.notificationService.error(message);
      throw new Error(message);
    }

    const url = state.url;

    const {
      rootId
    } = getParamsFromUrl(url);

    const parentId: string | undefined = url.split('/')[3];

    const targetPath = 'users';

    return new Promise((resolve, reject) => {
      this.appService.loadingOn();

      resolve(
        [
          this.entityRepository.getEntity$$(
            parentId,
            targetPath
          ).pipe(
            tap(() => this.appService.loadingOff())
          ),
        ]
      )
    });
  }
}

