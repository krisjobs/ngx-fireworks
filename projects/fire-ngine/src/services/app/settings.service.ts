import { Inject, Injectable, signal } from "@angular/core";

import { APP_CONFIG, AppConfig, QuerySettings } from "../../models";

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  // private activeModuleId = signal<string | null>(null);
  private $activeSectionId = signal<string | null>(null);
  private $activeEntityId = signal<string | null>(null);

  public $querySettings: Record<string, typeof signal<QuerySettings>> = {};

  constructor(
    @Inject(APP_CONFIG) private appConfig: AppConfig,
  ) {
    for (const sectionId in this.appConfig.sections) {
      this.$querySettings[sectionId] = signal<QuerySettings>({
        paginator: {
          querySize: 10,
          pageIndex: 0,
          pageSize: 10,
        },
        filters: [],
        tabFilters: [],
        sectionFilters: [],
        viewFilters: {}
      });
    }
  }



  // private $activeTabIdx = new BehaviorSubject<number>(JSON.parse(
  //   localStorage.getItem(
  //     `${this.sectionConfig.sectionKey}.activeTabIdx`
  //   ) || '0'
  // ));
  // private $activeFormIdx = new BehaviorSubject<number>(JSON.parse(
  //   localStorage.getItem(
  //     `${this.sectionConfig.sectionKey}.activeFormIdx`
  //   ) || '0'
  // ));
  // public activeTabIdx$ = this.$activeTabIdx.asObservable();
  // public activeFormIdx$ = this.$activeFormIdx.asObservable();

  // public get activeTabIdx(): number {
  //   return this.$activeTabIdx.value;
  // }

  // public get activeFormIdx(): number {
  //   return this.$activeFormIdx.value;
  // }

  // public set activeTabIdx(value: number) {
  //   this.$activeTabIdx.next(value);

  //   this.querySettings = {
  //     sectionFilters: this.sectionConfig.sectionFilters ?? [],
  //     tabFilters: this.entityConfig.tabFilters ?? []
  //   };

  //   localStorage.setItem(
  //     `${this.sectionConfig.sectionKey}.activeTabIdx`,
  //     JSON.stringify(value)
  //   );
  // }

  // public set activeFormIdx(value: number) {
  //   if (value < (this.entityConfig.templateSettings ?? []).length) {
  //     this.$activeFormIdx.next(value);
  //   } else {
  //     return;
  //   }

  //   // this.querySettings = {
  //   //   sectionFilters: this.sectionConfig.sectionFilters ?? [],
  //   //   tabFilters: this.entityConfig.tabFilters ?? []
  //   // };

  //   localStorage.setItem(
  //     `${this.sectionConfig.sectionKey}.activeFormIdx`,
  //     JSON.stringify(value)
  //   );
  // }

  private $activeTabIdx = signal<number>(0);


  private $querySettings = signal<QuerySettings>({
    paginator: {
      pageIndex: 0,
      pageSize: 10
    },
    tabFilters: {},
    sectionFilters: {}
  });

  private $settings = signal<LocalStorageSettings>({
    user: {}
  });

  public get settings() {
    return this.$settings();
  }

  public set settings(settings: LocalStorageSettings) {
    this.$settings.set(settings);
  }

  setItem(key: string, value: any) {
    localStorage.setItem(
      `$${this.sectionConfig.sectionKey}.${this.entityConfig.entityId}.${key}`,
      JSON.stringify(value)
    );
  }

  // private $viewSettings = this.sectionConfig.tabs.map(
  //   (tab, idx) => new BehaviorSubject<ViewSettings>({
  //     ...tab.viewSettings,
  //     ...JSON.parse(
  //       localStorage.getItem(
  //         `${this.sectionConfig.sectionKey}.${this.entityConfig.entityId}.viewSettings.${idx}`
  //       ) || '{}'
  //     )
  //   })
  // );

  // private $querySettings = this.sectionConfig.tabs.map(
  //   (tab, idx) => new BehaviorSubject<QuerySettings>({
  //     ...tab.querySettings,
  //     ...JSON.parse(
  //       localStorage.getItem(
  //         `${this.sectionConfig.sectionKey}.${this.entityConfig.entityId}.querySettings.${idx}`
  //       ) || '{}'
  //     )
  //   })
  // );

  // private $templateSettings = this.sectionConfig.tabs.map(
  //   (tab, tabIdx) => (tab.templateSettings ?? []).map(
  //     (settings, formIdx) => new BehaviorSubject<QuerySettings>({
  //       ...settings,
  //       ...JSON.parse(
  //         localStorage.getItem(
  //           `${this.sectionConfig.sectionKey}.${this.entityConfig.entityId}.templateSettings.${tabIdx}.${formIdx}`
  //         ) || '{}'
  //       )
  //     })
  //   )
  // );

  // private $contextSettings = this.sectionConfig.tabs.map(
  //   (tab, tabIdx) => (tab.contextSettings ?? []).map(
  //     (settings, formIdx) => new BehaviorSubject<ViewSettings>({
  //       ...settings,
  //       ...JSON.parse(
  //         localStorage.getItem(
  //           `${this.sectionConfig.sectionKey}.${this.entityConfig.entityId}.contextSettings.${tabIdx}.${formIdx}`
  //         ) || '{}'
  //       )
  //     })
  //   )
  // );

  // public viewSettings$ = combineLatest([
  //   this.activeTabIdx$,
  //   this.appService.currentUrl$,
  //   this.authService.userRoles$$
  // ]).pipe(
  //   switchMap(
  //     ([activeTabIdx, url, roles]) => this.$viewSettings[activeTabIdx].pipe(
  //       map(
  //         viewSettings => {
  //           if (!!this.entityConfig.viewSettingsStrategy) {
  //             return {
  //               ...viewSettings,
  //               ...this.entityConfig.viewSettingsStrategy({
  //                 url: getParamsFromUrl(url),
  //                 roles
  //               })
  //             }
  //           }

  //           return viewSettings;
  //         }
  //       )
  //     )
  //   )
  // );

  // public querySettings$ = this.activeTabIdx$.pipe(
  //   switchMap(
  //     activeTabIdx => this.$querySettings[activeTabIdx].asObservable()
  //   )
  // );

  // public _templateSettings$ = combineLatest([
  //   this.activeTabIdx$,
  //   this.activeFormIdx$,
  // ]).pipe(
  //   switchMap(
  //     ([activeTabIdx, activeFormIdx]) => (this.$templateSettings[activeTabIdx][activeFormIdx]?.asObservable() ?? of(null)).pipe(
  //       map(
  //         settings => [settings, activeFormIdx] as [QuerySettings, number]
  //       )
  //     )
  //   ),
  // );

  // public templateSettings$ = this._templateSettings$.pipe(
  //   map(
  //     ([settings]) => settings
  //   )
  // );

  // public contextSettings$ = combineLatest([
  //   this.activeTabIdx$,
  //   this.activeFormIdx$,
  //   this.appService.currentUrl$,
  // ]).pipe(
  //   switchMap(
  //     ([activeTabIdx, activeFormIdx, url]) => this.$contextSettings[activeTabIdx][activeFormIdx]?.asObservable() ?? of(null).pipe(
  //       map(
  //         viewSettings => {
  //           // if (!!this.entityConfig.viewSettingsStrategy) {
  //           //   return {
  //           //     ...viewSettings,
  //           //     ...this.entityConfig.viewSettingsStrategy(url)
  //           //   }
  //           // }

  //           return viewSettings;
  //         }
  //       )
  //     )
  //   )
  // );

  // public get viewSettings(): ViewSettings {
  //   return this.$viewSettings[this.activeTabIdx].value;
  // }

  // public get querySettings(): QuerySettings {
  //   return this.$querySettings[this.activeTabIdx].value;
  // }

  // public get templateSettings(): QuerySettings {
  //   return this.$templateSettings[this.activeTabIdx][this.activeFormIdx]?.value;
  // }

  // public get contextSettings(): ViewSettings {
  //   return this.getContextSettings();
  // }

  // public getContextSettings(formIdx = this.activeFormIdx): ViewSettings {
  //   return this.$contextSettings[this.activeTabIdx][formIdx]?.value;
  // }

  // public set viewSettings(viewSettings: Partial<ViewSettings>) {
  //   const {
  //     ...defaultSettings
  //   } = this.entityConfig.viewSettings;

  //   const newSettings = !!viewSettings ?
  //     {
  //       ...this.viewSettings,
  //       ...viewSettings
  //     } :
  //     {
  //       ...this.viewSettings,
  //       ...defaultSettings,
  //     };

  //   this.$viewSettings[this.activeTabIdx].next(newSettings);

  //   localStorage.setItem(
  //     `${this.sectionConfig.sectionKey}.${this.entityConfig.entityId}.viewSettings.${this.activeTabIdx}`,
  //     JSON.stringify(newSettings)
  //   );
  // }

  // public set querySettings(querySettings: Partial<QuerySettings>) {
  //   const {
  //     paginator,
  //     tabFilters,
  //     sectionFilters,
  //     ...defaultSettings
  //   } = this.entityConfig.querySettings;

  //   const newSettings = !!querySettings ?
  //     {
  //       ...this.querySettings,
  //       ...querySettings
  //     } :
  //     {
  //       ...this.querySettings,
  //       ...defaultSettings
  //     };

  //   this.$querySettings[this.activeTabIdx].next(newSettings);

  //   localStorage.setItem(
  //     `${this.sectionConfig.sectionKey}.${this.entityConfig.entityId}.querySettings.${this.activeTabIdx}`,
  //     JSON.stringify(newSettings)
  //   );
  // }

  // public set templateSettings(templateSettings: Partial<QuerySettings>) {
  //   const {
  //     paginator,
  //     tabFilters,
  //     sectionFilters,
  //     ...defaultSettings
  //   } = this.entityConfig.templateSettings![this.$activeFormIdx.value];

  //   const newSettings: QuerySettings = !!templateSettings ?
  //     {
  //       ...this.templateSettings,
  //       ...templateSettings
  //     } :
  //     {
  //       ...this.templateSettings,
  //       ...defaultSettings
  //     };

  //   this.$templateSettings[this.activeTabIdx][this.$activeFormIdx.value].next(newSettings);

  //   localStorage.setItem(
  //     `${this.sectionConfig.sectionKey}.${this.entityConfig.entityId}.templateSettings.${this.activeTabIdx}.${this.activeFormIdx}`,
  //     JSON.stringify(newSettings)
  //   );
  // }

  // public set contextSettings(templateSettings: Partial<ViewSettings>) {
  //   this.setContextSettings(templateSettings);
  // }

  // public setContextSettings(templateSettings: Partial<ViewSettings>, formIdx = this.activeFormIdx) {
  //   const {
  //     ...defaultSettings
  //   } = this.entityConfig.contextSettings![this.$activeFormIdx.value];

  //   const newSettings: ViewSettings = !!templateSettings ?
  //     {
  //       ...this.getContextSettings(),
  //       ...templateSettings
  //     } :
  //     {
  //       ...this.getContextSettings(),
  //       ...defaultSettings
  //     };

  //   localStorage.setItem(
  //     `${this.sectionConfig.sectionKey}.${this.entityConfig.entityId}.contextSettings.${this.activeTabIdx}.${this.activeFormIdx}`,
  //     JSON.stringify(newSettings)
  //   );
  //   this.$contextSettings[this.activeTabIdx][formIdx].next(newSettings);
  // }


  // public resetTemplateSettings() {
  //   this.$templateSettings.forEach(
  //     $templateSettings => {
  //       const nextValue = this.entityConfig.templateSettings![this.activeTabIdx];
  //       $templateSettings.forEach(
  //         (_, formIdx) => {
  //           this.$templateSettings[this.activeTabIdx][formIdx].next(nextValue);
  //         }
  //       );
  //     }
  //   );
  // }

  // public resetContextSettings() {
  //   this.$contextSettings.forEach(
  //     $contextSettings => {
  //       const nextValue = this.entityConfig.contextSettings![this.activeTabIdx];
  //       $contextSettings.forEach(
  //         (_, formIdx) => {
  //           this.$contextSettings[this.activeTabIdx][formIdx].next(nextValue);
  //         }
  //       );
  //     }
  //   );
  // }
}
