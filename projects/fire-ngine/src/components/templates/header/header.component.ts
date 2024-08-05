import { Component, computed, output, Signal } from '@angular/core';
import { MatIconButton, MatButton, MatAnchor, MatMiniFabButton, MatMiniFabAnchor } from '@angular/material/button';
import { MatIcon } from '@angular/material/icon';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { MatMenu, MatMenuItem, MatMenuTrigger } from '@angular/material/menu';
import { Inject } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop';
import { and, or, collection, Firestore, query, where, getDocs, orderBy } from '@angular/fire/firestore';

import { CoreService } from '../../../services/app/core.service';
import { UserService } from '../../../services/data/user.service';
import { LIB_CONFIG, LibConfig, ModuleConfig, ModuleConfigParams } from '../../../models';
import { AuthService, FunctionsService } from '../../../services';


@Component({
  selector: 'fng-header',
  standalone: true,
  imports: [
    MatIconButton,
    MatButton,
    MatAnchor,
    MatIcon,
    RouterLink,
    RouterLinkActive,
    MatMenu,
    MatMenuTrigger,
    MatMenuItem,
    MatMiniFabButton,
    MatMiniFabAnchor,
    AsyncPipe,
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {
  public onToggleSidenav = output<void>();

  private $userRoles = toSignal(this.authService.userRoles$$);

  private $moduleConfigParams: Signal<Partial<ModuleConfigParams>> = computed(() => {
    const userRoles = this.$userRoles();
    if (!userRoles) {
      return {};
    } else {
      return {
        userRoles
      }
    }
  });

  public $authUser = toSignal(this.userService.authUser$$);
  public $avatarUrl = computed(() => `url(${this.$authUser()!.photoURL})`);
  public $avatarBackground = computed(() => this.$authUser() ? this.$avatarUrl() : undefined);


  // public get currentLocale(): string {
  //   return this.locale.toUpperCase();
  // }

  private get modules(): ModuleConfig[] {
    return this.libConfig.modules;
  }
  constructor(
    // @Inject(LOCALE_ID) public locale: string,
    @Inject(LIB_CONFIG) private libConfig: LibConfig,
    private coreService: CoreService,
    private userService: UserService,
    private functionsService: FunctionsService,
    private authService: AuthService,
    private router: Router,

    private firestore: Firestore
  ) { }

  public $modules = computed(() => {
    return this.modules.map(module => {
      return {
        ...module,
        hiddenFromHeader: module.hiddenFromHeader?.(this.$moduleConfigParams())
      }
    });
  });

  public toggleSidenav() {
    this.onToggleSidenav.emit();
  }

  public test() {
    this.coreService.toggleLoading();

    this.router.navigate(['/test']);

    setTimeout(() => {
      this.coreService.toggleLoading();
    }, 1000);
  }

  public testFunction() {
    this.functionsService.callFunction$<{ wow: string }>(
      'helloWorld',
      {
        origin: '420681'
      }
    ).subscribe(
      (data) => {
        const {
          wow
        } = data;

        console.warn(wow);
      }
    );
  }

  public testQuery() {
    const colRef = collection(this.firestore, 'users');
    const queryRef = query(
      colRef,
      or(
        and(
          where("test1", 'in', [1, 2, 3]),
          where("test3", 'array-contains-any', [1, 2, 3]),
        ),
        and(
          where("test4", '==', 3),
          where("test3", 'array-contains', 3),
        )
      ),
      // where("test3", '>=', 2),
      // where("test5", '==', 2),
      // orderBy("test7"),
      orderBy("test3"),
    );

    getDocs(queryRef).then((snapshot) => {
      console.log(snapshot.docs);
    });
  }

  public googleLogIn() {
    this.userService.googleLogIn();
  }

  public logIn() {
    // this.userService.emailLogIn();
  }

  public logOut() {
    this.userService.logOut();
  }

  public changeLanguage() {
    // Use the base URL of your application if it's not at the domain root
    const baseUrl = window.location.origin; // This will give you 'https://example.com'

    // const localeSuffix = this.currentLocale === 'EN' ? 'ar/' : '';
    // Redirect to the locale version of the app
    // window.location.href = `${baseUrl}/${localeSuffix}`;
  }
}
