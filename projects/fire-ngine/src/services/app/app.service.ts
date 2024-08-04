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

  constructor(
    @Inject(APP_CONFIG) private appConfig: AppConfig,
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
}
