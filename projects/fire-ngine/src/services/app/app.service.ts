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
export class AppService {

  private readonly appVersionKey = 'app.version';
  private readonly currentVersion = environment.version;

  private $hideSidenav = new BehaviorSubject<boolean>(true);
  public hideSidenav$ = this.$hideSidenav.asObservable();
  public get hideSidenav() {
    return this.$hideSidenav.value;
  }
  public set hideSidenav(value: boolean) {
    this.$hideSidenav.next(value);
  }
  public toggleSidenav() {
    this.hideSidenav = !this.hideSidenav;
  }


  private $loading = new BehaviorSubject<boolean>(false);
  public loading$ = this.$loading.asObservable();

  public showLoaderUntilCompleted<T>(obs$: Observable<T>): Observable<T> {
    return of(null)
      .pipe(
        tap(() => this.loadingOn()),
        concatMap(() => obs$),
        take(1),
        finalize(() => this.loadingOff())
      );
  }

  public loadingOn() {
    this.$loading.next(true);

  }

  public loadingOff() {
    this.$loading.next(false);
  }

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
    this.checkVersion();
  }

  private checkVersion() {
    const lastKnownVersion = localStorage.getItem(
      this.appVersionKey
    );

    if (lastKnownVersion !== this.currentVersion) {
      this.resetLocalStorage();

      console.warn(`Local storage cleared -> version ${this.currentVersion}`)
    }
  }

  public resetLocalStorage() {
    localStorage.clear();

    localStorage.setItem(
      this.appVersionKey,
      this.currentVersion
    );
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
