import { Component, Inject, OnInit } from '@angular/core';
import { MatSidenav, MatSidenavContent, MatSidenavContainer } from '@angular/material/sidenav';
import { map, Observable, tap } from 'rxjs';


import { NavigationLink, DashboardLayout } from '../../../models/ui/framework.models';
import { getParamsFromUrl } from '../../../utility/app/entity.utils';
import { CoreService } from '../../../services';
import { MatNavList } from '@angular/material/list';
import { MatDivider } from '@angular/material/divider';


@Component({
  selector: 'fng-module',
  standalone: true,
  imports: [
    MatSidenav,
    MatSidenavContent,
    MatSidenavContainer,
    MatNavList,
    MatDivider,
  ],
  templateUrl: './module.component.html',
  styleUrls: ['./module.component.scss']
})
export class ModuleComponent {

  public sidenavOpened = this.coreService.sidenavOpened;

  public showLanding$: Observable<boolean> = this.appService.currentUrl$.pipe(
    map(url => {
      const urlSegments = url.split('/');

      return urlSegments.length <= 2 && !!this.layout;
    })
  );

  public footing$ = this.appService.currentUrl$.pipe(
    map(url => this.appConfig.footerTitleStrategy({
      url: getParamsFromUrl(url)
    }))
  );

  public userRoles$ = this.authService.userRoles$$.pipe(
    tap(console.warn)
  );

  public currentUrl$ = this.appService.currentUrl$;

  public get navLinks(): NavigationLink[][] {
    return this.moduleConfig.navLinks;
  }

  public get showNavLinks() {
    return !!this.moduleConfig.showNavLinksHome;
  }

  public get styles() {
    return this.appConfig.styles;
  }

  public get layout(): DashboardLayout | undefined {
    return this.moduleConfig.homeLayout;
  };

  constructor(
    // @Inject(APP_CONFIG) private appConfig: AppConfig,
    // @Inject(MODULE_CONFIG) private moduleConfig: ModuleConfig,
    // private appService: AppService,
    // private authService: AuthService,
    // private functionsService: FunctionsService,
    private coreService: CoreService,
  ) {
  }

  public reloadPage(link: string, url: string) {
    if (url.includes(link) && url.includes('?')) {
      setTimeout(() => {
        window.location.reload();
      }, 0);
    }
  }
}
