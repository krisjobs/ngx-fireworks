import { HttpClient } from "@angular/common/http";
import { Inject, Injectable } from "@angular/core";
import { User } from "@angular/fire/auth";
import { Router } from "@angular/router";
import { combineLatest, map, switchMap, take } from "rxjs";

import { Entity, now } from "../../common/models";
import { StorageService, AuthService, Controller, EntityService, NotificationService, AppService } from "..";


@Injectable({
  providedIn: 'root'
})
export class UserController extends Controller {

  constructor(
    @Inject(SECTION_CONFIG) protected override sectionConfig: SectionConfig,
    protected override entityService: EntityService,
    protected override entityRepository: EntityRepository,
    protected override appService: AppService,
    protected override authService: AuthService,
    protected override functionsService: FunctionsService,
    protected override storageService: StorageService,
    protected notificationService: NotificationService,
    protected httpClient: HttpClient,
    protected override router: Router,
  ) {
    super(
      sectionConfig,
      entityService,
      entityRepository,
      appService,
      authService,
      functionsService,
      storageService,
      router,
    );
  }

  public override getActionStates$(forTemplates = false) {
    return combineLatest([
      this.entityService.viewSettings$,
      this.entityService.querySettings$,
      this.entityService.templateSettings$,
      this.entityService.contextSettings$,
    ]).pipe(
      map(([viewSettings, querySettings, templateSettings, contextSettings]) => ({
        // collection actions
        'share-network': () => 'default',

        // view actions
        'show-verified': () => {
          const viewFilter = (!forTemplates ? querySettings : templateSettings).viewFilters['showVerified'];

          if (!viewFilter) {
            return 'hide-verified';
          } else {
            if (!viewFilter.value) {
              return 'verified-only';
            } else {
              return 'default';
            }
          }
        },
        // document actions
        'send-invitation': () => 'default',
        'sync-auth': () => 'default',
        'set-connections': () => 'default',
        'assign-team': () => 'default',

        // * connections
        'connect-user': ({
          entity: user,
          context,
        }: Partial<ConfigParams<User>>) => {
          const connection = context?.query as Entity;

          return user!.data.subscribers?.includes(connection.id!) ? 'connected' : 'not-connected';
        },

        // * subscriptions
        'subscribe-user': ({
          entity: user,
          context,
        }: Partial<ConfigParams<User>>) => {
          const subscriber = context?.query as Entity;

          return subscriber.data.subscribers?.includes(user!.id) ? 'subscribed' : 'not-subscribed';
        },
        // (user?: User, entity?: Entity) => entity?.data.subscribers?.includes(user!.id) ? 'subscribed' : 'not-subscribed',

        // * relatedId
        'relate-user': ({
          entity: user,
          context,
        }: Partial<ConfigParams<User>>) => {
          const related = context?.query as Entity;

          return related.attributes.relatedId === user?.id ? 'related' : 'not-related';
        },
        // (user?: User, entity?: Entity) => entity?.attributes.relatedId === user?.id ? 'related' : 'not-related',


      } as EntityActionStates)),
      switchMap(actions => super.getActionStates$(forTemplates).pipe(
        map(entityActions => ({
          ...actions,
          ...entityActions
        })),
      ))
    );
  }

  public override invokeAction(params: InvokeActionParams<User>): void {
    const {
      action,
      url,
      entity: user,
      context,
      forTemplates,
    } = params;

    const {
      moduleName,
      rootType,
      rootId,
      nestedType,
      nestedId,
      queryType,
      queryId,
    } = url;

    switch (action.id) {
      // collection actions
      case 'create-entity': { // ! override
        super.invokeAction({
          ...params,
          dialogSettings: {
            newId: `${Math.random().toString(36).slice(2, 10)}${now().toMillis().toString().split('').map((x, idx) => Math.random() < 0.5 ? String.fromCharCode(97 + parseInt(x)).toUpperCase() : String.fromCharCode(97 + parseInt(x))).join('')}${Math.random().toString(36).slice(2, 10)}`,
            ...params.dialogSettings,
            targetPath: 'users',
            onRequest: (user) => ({
              ...user,
              data: {
                ...user.data,
                subscribers: [
                  ...user.data.subscribers.filter((subId: string) => subId !== context?.query?.id),
                  ...(context?.query?.id ? [context.query.id] : [])
                ]
              },
            })
          }
        });
        break;
      }
      // doc actions
      case 'edit-entity': {
        super.invokeAction({
          ...params,
          dialogSettings: {
            ...params.dialogSettings,
            onResponse: (modifiedUser: User) => {
              const rolesChanged = JSON.stringify((user as User)!.roles) !== JSON.stringify(modifiedUser.roles);

              if (rolesChanged) {
                this.httpClient.post(environment.api.setRoles, { uid: user!.id, user: modifiedUser }).subscribe({
                  // this.functionsService.callFunction('setRoles').call() // TODO at some point
                  next: (response) => {
                    console.warn(response)
                    this.notificationService.message('Set roles successfully.');
                  },
                  error: (error: Error) => {
                    console.error(error.message);
                    this.notificationService.error('Could not set roles.');
                  }
                });
              }
            }
          }
        });
        break;
      }
      // view actions
      case 'show-verified': {
        const querySettings = !forTemplates ?
          this.entityService.querySettings :
          this.entityService.templateSettings;

        const viewFilter = querySettings.viewFilters['showVerified'];
        const viewFilters = {
          ['showVerified']: {
            name: 'showVerified',
            value: false,
            property: 'stats.emailVerified',
            equality: true,
          },
          ...querySettings.viewFilters,
        };

        if (!viewFilter) {
          if (!forTemplates) {
            this.entityService.querySettings = {
              viewFilters
            };
          } else {
            this.entityService.templateSettings = {
              viewFilters
            };
          }
        } else {
          if (!viewFilter.value) {
            const viewFilters = {
              ...querySettings.viewFilters,
              ['showVerified']: {
                name: 'showVerified',
                value: true,
                property: 'stats.emailVerified',
                equality: true,
              }
            };

            if (!forTemplates) {
              this.entityService.querySettings = {
                viewFilters
              };
            } else {
              this.entityService.templateSettings = {
                viewFilters
              };
            }
          } else {
            const {
              showVerified,
              ...viewFilters
            } = querySettings.viewFilters;

            if (!forTemplates) {
              this.entityService.querySettings = {
                viewFilters
              };
            } else {
              this.entityService.templateSettings = {
                viewFilters
              };
            }
          }
        }
        break;
      }

      // document actions
      case 'remove-entity':
        this.entityService.removeEntityDialog(
          user!,
          {
            onResponse: () => {
              this.httpClient.post(environment.api.disableUser, { uid: user!.id, disabled: !user!.attributes.isArchived }).subscribe({
                next: (response) => {
                  console.warn(response)
                  this.notificationService.message(`User ${user!.attributes.isArchived ? 'enabled' : 'disabled'} successfully`);
                },
                error: (error: Error) => {
                  console.error(error.message);
                  this.notificationService.error('Could not disable user');
                }
              });
            }
          }
        );
        break;

      case 'assign-team': {
        const related = context?.query as Entity;
        const orgType = related.attributes.type;

        this.appService.navigateTo({
          moduleName,
          rootType: 'team',
          queryType: orgType,
          queryId: related.id,
        });
      } break;

      case 'subscribe-user': {
        const related = context?.query as Entity;
        let subscribers = related.data.subscribers ?? [];
        const subscriberId = user!.id;

        if (!subscribers.includes(subscriberId)) {
          subscribers.push(subscriberId);
        } else {
          subscribers = subscribers.filter(id => id !== subscriberId);
        }

        this.entityService.updateEntity({
          ...related,
          data: {
            ...related!.data,
            subscribers,
          }
        });
      } break;

      case 'connect-user': {
        const related = context?.query as Entity;

        let connections = user!.data.subscribers ?? [];
        const connectionId = related.id;

        if (!connections.includes(connectionId)) {
          connections.push(connectionId);
        } else {
          connections = connections.filter(id => id !== connectionId);
        }

        this.entityService.updateEntity({
          ...user,
          data: {
            ...user!.data,
            subscribers: connections,
          }
        });
      } break;

      case 'relate-user': {
        const related = context?.query as Entity;
        let relatedId = user!.id;

        this.entityService.updateEntity({
          ...related,
          attributes: {
            ...related!.attributes,
            relatedId: !!related?.attributes.relatedId && related?.attributes.relatedId === relatedId ?
              null : relatedId,
          }
        });
      } break;

      case 'set-connections':
        this.router.navigate(
          ['admin', 'users', user!.id, 'connections'],
        );
        break;

      case 'send-invitation':
        if ((user as User).information.email) {
          this.authService.sendSignInLinkToEmail((user as User)!.information.email!);
        }
        break;

      case 'sync-auth':
        this.httpClient.post(environment.api.syncAuth, { user })
          .pipe(take(1))
          .subscribe({
            error: (error: Error) => {
              const message = 'Error while syncing user data.';
              console.error(error.message);
              this.notificationService.error(message);
            },
            complete: () => {
              const message = 'Successfully synced user data.';
              this.notificationService.message(message);
            }
          })
        break;

      case 'share-network': {
        const related = context?.query as Entity;

        // TODO fix not consistent with default
        this.appService.navigateTo({
          moduleName: 'organizations',
          rootType: related.id,
          rootId: 'network',
        });
      } break;

      default:
        super.invokeAction(params);
    }
  }
}
