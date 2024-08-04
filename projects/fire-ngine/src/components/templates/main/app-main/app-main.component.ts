import { Component, Inject, OnInit, ViewChild } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';
import { map, NEVER, Observable } from 'rxjs';

import { AppConfig, NavigationLink } from 'src/app/styleguide';

import { APP_CONFIG } from 'src/app/styleguide/services/app.providers';
import { UserService } from 'src/app/styleguide/modules/users/services/user.service';
import { AppService } from 'src/app/styleguide/services/app.service';
import { AuthService } from 'src/app/styleguide/modules/firebase/services/auth.service';
import { getParamsFromUrl } from 'src/app/styleguide/utility';


@Component({
  selector: 'lib-app-main',
  templateUrl: './app-main.component.html',
  styleUrls: ['./app-main.component.scss']
})
export class AppMainComponent implements OnInit {

  public avatarUrl$$: Observable<string | null> = this.userService.avatarUrl$$;

  public userRoles$ = this.authService.userRoles$$;

  public get links(): NavigationLink[] {
    return this.config.navLinks;
  }

  public get userLink() {
    return this.config.userLink;
  }

  public get showHeaderLinks() {
    return !!this.config.showHeaderLinks;
  }

  public get styles() {
    return this.config.styles;
  }

  public get headerLinkStrategy() {
    return this.config.headerLinkStrategy;
  }

  public get headerLinkBreakpoints() {
    return this.config.headerLinkBreakpoints;
  }

  @ViewChild(MatSidenav)
  public sidenav!: MatSidenav;

  public headingSegments$$ = this.appService.currentUrl$.pipe(
    map(url => this.config.headerTitleStrategy({
      url: getParamsFromUrl(url)
    }))
  );

  public $showHeaderLinks$ = this.showHeaderLinks && !!this.headerLinkStrategy && !!this.headerLinkBreakpoints ?
    this.appService.breakpointObserver$(
      this.config.headerLinkBreakpoints!,
      this.config.headerLinkStrategy!
    ) :
    NEVER;

  constructor(
    @Inject(APP_CONFIG) private config: AppConfig,
    private userService: UserService,
    private appService: AppService,
    private authService: AuthService,
  ) { }

  ngOnInit(): void {
  }

  public getLinkClassAttr(link: NavigationLink): string | void {
    const classes = link.classes;
    if (!!classes && !!classes.length) {
      return classes.join(' ');
    }
  }

  public openSideNav() {
    this.sidenav.open();
  }

  public closeSideNav() {
    this.sidenav.close();
  }
}
