import { Component, computed, Inject, OnInit, Signal, ViewChild } from '@angular/core';
// import { Meta, Title } from '@angular/platform-browser';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { MatSidenav, MatSidenavContent, MatSidenavContainer } from '@angular/material/sidenav'
import { MatListItem, MatNavList } from '@angular/material/list'
import { toSignal } from '@angular/core/rxjs-interop';

import { MainComponent } from '../../templates/main/main.component';
import { HeaderComponent } from '../../templates/header/header.component';
import { FooterComponent } from '../../templates/footer/footer.component';
import { ModuleConfig, ModuleConfigParams, LIB_CONFIG, LibConfig } from '../../../models';
import { AuthService } from '../../../services';


@Component({
  selector: 'fng-layout',
  standalone: true,
  imports: [
    RouterLink,
    RouterLinkActive,
    HeaderComponent,
    FooterComponent,
    MainComponent,
    MatSidenav,
    MatSidenavContent,
    MatSidenavContainer,
    MatNavList,
    MatListItem,
  ],
  templateUrl: './layout.component.html',
  styleUrl: './layout.component.scss'
})
export class LayoutComponent implements OnInit {
  title = 'h2oasis-landing';

  @ViewChild(MatSidenav)
  public sidenav!: MatSidenav;

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

  private get modules (): ModuleConfig[] {
    return this.libConfig.modules;
  }

  public $modules = computed(() => {
    return this.modules.map(module => {
      return {
        ...module,
        hiddenFromSidenav: module.hiddenFromSidenav?.(this.$moduleConfigParams())
      }
    });
  });

  constructor(
    // private titleService: Title,
    // private metaService: Meta,

    private authService: AuthService,
    @Inject(LIB_CONFIG) private libConfig: LibConfig,
  ) {
  }

  ngOnInit() {
    console.log('layout init')
    // this.titleService.setTitle($localize`H2Oasis`);
    // this.metaService.updateTag({
    //   name: 'description',
    //   content: 'H2Oasis - description'
    // })
  }

  public hideModule(module: ModuleConfig): boolean {
    return true
  }

  public openSideNav() {
    this.sidenav.open();
  }

  public closeSideNav() {
    this.sidenav.close();

    const activeElement = document.activeElement as HTMLElement;
    activeElement.blur()
  }
}
