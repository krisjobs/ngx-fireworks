import { Injectable } from "@angular/core";

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(
  ) {
  }



  private $viewSettings = this.sectionConfig.tabs.map(
    (tab, idx) => new BehaviorSubject<ViewSettings>({
      ...tab.viewSettings,
      ...JSON.parse(
        localStorage.getItem(
          `${this.sectionConfig.sectionKey}.${this.entityConfig.descriptor}.viewSettings.${idx}`
        ) || '{}'
      )
    })
  );

  private $querySettings = this.sectionConfig.tabs.map(
    (tab, idx) => new BehaviorSubject<QuerySettings>({
      ...tab.querySettings,
      ...JSON.parse(
        localStorage.getItem(
          `${this.sectionConfig.sectionKey}.${this.entityConfig.descriptor}.querySettings.${idx}`
        ) || '{}'
      )
    })
  );

  private $templateSettings = this.sectionConfig.tabs.map(
    (tab, tabIdx) => (tab.templateSettings ?? []).map(
      (settings, formIdx) => new BehaviorSubject<QuerySettings>({
        ...settings,
        ...JSON.parse(
          localStorage.getItem(
            `${this.sectionConfig.sectionKey}.${this.entityConfig.descriptor}.templateSettings.${tabIdx}.${formIdx}`
          ) || '{}'
        )
      })
    )
  );

  private $contextSettings = this.sectionConfig.tabs.map(
    (tab, tabIdx) => (tab.contextSettings ?? []).map(
      (settings, formIdx) => new BehaviorSubject<ViewSettings>({
        ...settings,
        ...JSON.parse(
          localStorage.getItem(
            `${this.sectionConfig.sectionKey}.${this.entityConfig.descriptor}.contextSettings.${tabIdx}.${formIdx}`
          ) || '{}'
        )
      })
    )
  );

  public viewSettings$ = combineLatest([
    this.activeTabIdx$,
    this.appService.currentUrl$,
    this.authService.userRoles$$
  ]).pipe(
    switchMap(
      ([activeTabIdx, url, roles]) => this.$viewSettings[activeTabIdx].pipe(
        map(
          viewSettings => {
            if (!!this.entityConfig.viewSettingsStrategy) {
              return {
                ...viewSettings,
                ...this.entityConfig.viewSettingsStrategy({
                  url: getParamsFromUrl(url),
                  roles
                })
              }
            }

            return viewSettings;
          }
        )
      )
    )
  );

  public querySettings$ = this.activeTabIdx$.pipe(
    switchMap(
      activeTabIdx => this.$querySettings[activeTabIdx].asObservable()
    )
  );

  public _templateSettings$ = combineLatest([
    this.activeTabIdx$,
    this.activeFormIdx$,
  ]).pipe(
    switchMap(
      ([activeTabIdx, activeFormIdx]) => (this.$templateSettings[activeTabIdx][activeFormIdx]?.asObservable() ?? of(null)).pipe(
        map(
          settings => [settings, activeFormIdx] as [QuerySettings, number]
        )
      )
    ),
  );

  public templateSettings$ = this._templateSettings$.pipe(
    map(
      ([settings]) => settings
    )
  );

  public contextSettings$ = combineLatest([
    this.activeTabIdx$,
    this.activeFormIdx$,
    this.appService.currentUrl$,
  ]).pipe(
    switchMap(
      ([activeTabIdx, activeFormIdx, url]) => this.$contextSettings[activeTabIdx][activeFormIdx]?.asObservable() ?? of(null).pipe(
        map(
          viewSettings => {
            // if (!!this.entityConfig.viewSettingsStrategy) {
            //   return {
            //     ...viewSettings,
            //     ...this.entityConfig.viewSettingsStrategy(url)
            //   }
            // }

            return viewSettings;
          }
        )
      )
    )
  );

  public get viewSettings(): ViewSettings {
    return this.$viewSettings[this.activeTabIdx].value;
  }

  public get querySettings(): QuerySettings {
    return this.$querySettings[this.activeTabIdx].value;
  }

  public get templateSettings(): QuerySettings {
    return this.$templateSettings[this.activeTabIdx][this.activeFormIdx]?.value;
  }

  public get contextSettings(): ViewSettings {
    return this.getContextSettings();
  }

  public getContextSettings(formIdx = this.activeFormIdx): ViewSettings {
    return this.$contextSettings[this.activeTabIdx][formIdx]?.value;
  }

  public set viewSettings(viewSettings: Partial<ViewSettings>) {
    const {
      ...defaultSettings
    } = this.entityConfig.viewSettings;

    const newSettings = !!viewSettings ?
      {
        ...this.viewSettings,
        ...viewSettings
      } :
      {
        ...this.viewSettings,
        ...defaultSettings,
      };

    this.$viewSettings[this.activeTabIdx].next(newSettings);

    localStorage.setItem(
      `${this.sectionConfig.sectionKey}.${this.entityConfig.descriptor}.viewSettings.${this.activeTabIdx}`,
      JSON.stringify(newSettings)
    );
  }

  public set querySettings(querySettings: Partial<QuerySettings>) {
    const {
      paginator,
      tabFilters,
      sectionFilters,
      ...defaultSettings
    } = this.entityConfig.querySettings;

    const newSettings = !!querySettings ?
      {
        ...this.querySettings,
        ...querySettings
      } :
      {
        ...this.querySettings,
        ...defaultSettings
      };

    this.$querySettings[this.activeTabIdx].next(newSettings);

    localStorage.setItem(
      `${this.sectionConfig.sectionKey}.${this.entityConfig.descriptor}.querySettings.${this.activeTabIdx}`,
      JSON.stringify(newSettings)
    );
  }

  public set templateSettings(templateSettings: Partial<QuerySettings>) {
    const {
      paginator,
      tabFilters,
      sectionFilters,
      ...defaultSettings
    } = this.entityConfig.templateSettings![this.$activeFormIdx.value];

    const newSettings: QuerySettings = !!templateSettings ?
      {
        ...this.templateSettings,
        ...templateSettings
      } :
      {
        ...this.templateSettings,
        ...defaultSettings
      };

    this.$templateSettings[this.activeTabIdx][this.$activeFormIdx.value].next(newSettings);

    localStorage.setItem(
      `${this.sectionConfig.sectionKey}.${this.entityConfig.descriptor}.templateSettings.${this.activeTabIdx}.${this.activeFormIdx}`,
      JSON.stringify(newSettings)
    );
  }

  public set contextSettings(templateSettings: Partial<ViewSettings>) {
    this.setContextSettings(templateSettings);
  }

  public setContextSettings(templateSettings: Partial<ViewSettings>, formIdx = this.activeFormIdx) {
    const {
      ...defaultSettings
    } = this.entityConfig.contextSettings![this.$activeFormIdx.value];

    const newSettings: ViewSettings = !!templateSettings ?
      {
        ...this.getContextSettings(),
        ...templateSettings
      } :
      {
        ...this.getContextSettings(),
        ...defaultSettings
      };

    localStorage.setItem(
      `${this.sectionConfig.sectionKey}.${this.entityConfig.descriptor}.contextSettings.${this.activeTabIdx}.${this.activeFormIdx}`,
      JSON.stringify(newSettings)
    );
    this.$contextSettings[this.activeTabIdx][formIdx].next(newSettings);
  }


  public resetTemplateSettings() {
    this.$templateSettings.forEach(
      $templateSettings => {
        const nextValue = this.entityConfig.templateSettings![this.activeTabIdx];
        $templateSettings.forEach(
          (_, formIdx) => {
            this.$templateSettings[this.activeTabIdx][formIdx].next(nextValue);
          }
        );
      }
    );
  }

  public resetContextSettings() {
    this.$contextSettings.forEach(
      $contextSettings => {
        const nextValue = this.entityConfig.contextSettings![this.activeTabIdx];
        $contextSettings.forEach(
          (_, formIdx) => {
            this.$contextSettings[this.activeTabIdx][formIdx].next(nextValue);
          }
        );
      }
    );
  }
}
