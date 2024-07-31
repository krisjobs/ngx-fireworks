import { Component, Inject, OnInit } from '@angular/core';
import { map, Observable, tap } from 'rxjs';
import { AuthService } from 'src/app/styleguide/modules/firebase/services/auth.service';
import { FunctionsService } from 'src/app/styleguide/modules/firebase/services/functions.service';
import { APP_CONFIG, MODULE_CONFIG } from 'src/app/styleguide/services/app.providers';
import { AppService } from 'src/app/styleguide/services/app.service';
import { AppConfig, DashboardLayout, ModuleConfig, NavigationLink } from 'src/app/styleguide';
import { getParamsFromUrl } from 'src/app/styleguide/utility';
// import { FirestoreIndexBuilder } from 'src/app/styleguide/modules/support/services/firestore-index.service';

@Component({
  selector: 'lib-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  public hideSidenav$ = this.appService.hideSidenav$;

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
    @Inject(APP_CONFIG) private appConfig: AppConfig,
    @Inject(MODULE_CONFIG) private moduleConfig: ModuleConfig,
    private appService: AppService,
    private authService: AuthService,
    private functionsService: FunctionsService,
    // private indexBuilder: FirestoreIndexBuilder,
  ) {
    // this.functionsService.callFunction$('dataMigration', { wow: 1, wow2: 2 }).subscribe(
    //   x => console.warn(x)
    // )
  }

  ngOnInit() {
  }

  public reloadPage(link: string, url: string) {
    if (url.includes(link) && url.includes('?')) {
      setTimeout(() => {
        window.location.reload();
      }, 0);
    }
  }
}
