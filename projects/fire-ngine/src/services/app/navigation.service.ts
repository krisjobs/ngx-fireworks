import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { Inject, Injectable } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { Observable, filter, map, shareReplay, combineLatest, tap, BehaviorSubject, of, concatMap, finalize, take } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AppConfig, UrlParams } from '..';
import { APP_CONFIG } from './app.providers';

// ===================== DEFINITIONS =====================

@Injectable({
  providedIn: 'root'
})
export class NavigationService {

  public currentUrl$: Observable<string> = this.router.events.pipe(
    filter((event) => event instanceof NavigationEnd),
    map((event) => (event as NavigationEnd).urlAfterRedirects),
    shareReplay(1),
  );

  constructor(
    @Inject(APP_CONFIG) private appConfig: AppConfig,
    private router: Router,
    private breakpointObserver: BreakpointObserver,
  ) {
  }

  public breakpointObserver$ = <T>(breakpoints: number[], outputs: T[]) => combineLatest(
    breakpoints.map(
      (breakpoint: number) => this.breakpointObserver.observe(`(min-width: ${breakpoint}px)`)
    )
  ).pipe(
    map(
      (matches: BreakpointState[]) => matches
        .findIndex(
          ({ matches }) => !matches
        )
    ),
    map(idx => {
      const trueIdx = idx === -1 ? breakpoints.length : idx
      const output = outputs[trueIdx];

      return output ?? outputs[0];
    }),
  );

  public navigateTo({
    moduleName,
    rootType,
    rootId,
    nestedType,
    nestedId,
    queryType,
    queryId,
  }: Partial<UrlParams>) {

    this.router.navigate(
      [
        moduleName,
        rootType,
        ...(rootId ? [rootId] : []),
        ...(nestedType ? [nestedType] : []),
        ...(nestedId ? [nestedId] : []),
      ],
      {
        queryParams: {
          ...(!!queryType && queryId ? {
            [`${queryType}`]: queryId
          } : {})
        }
      }
    );
  }

}
