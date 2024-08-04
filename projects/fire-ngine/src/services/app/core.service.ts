import { Injectable, signal } from '@angular/core';
import { Observable, of, tap, concatMap, take, finalize } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CoreService {
  private $appWidth = signal(0);
  private $loading = signal(false);
  private $sidenavOpened = signal(true);

  public get loading(): boolean {
    return this.$loading();
  }

  public set loading(loading: boolean) {
    this.$loading.set(loading);
  }

  public get sidenavOpened(): boolean {
    return this.$sidenavOpened();
  }

  public set sidenavOpened(loading: boolean) {
    this.$sidenavOpened.set(loading);
  }

  public get appWidth(): number {
    return this.$appWidth();
  }

  public set appWidth(width: number) {
    this.$appWidth.set(width);
  }





  private $activeTabIdx = new BehaviorSubject<number>(JSON.parse(
    localStorage.getItem(
      `${this.sectionConfig.sectionKey}.activeTabIdx`
    ) || '0'
  ));
  private $activeFormIdx = new BehaviorSubject<number>(JSON.parse(
    localStorage.getItem(
      `${this.sectionConfig.sectionKey}.activeFormIdx`
    ) || '0'
  ));
  public activeTabIdx$ = this.$activeTabIdx.asObservable();
  public activeFormIdx$ = this.$activeFormIdx.asObservable();

  public get activeTabIdx(): number {
    return this.$activeTabIdx.value;
  }

  public get activeFormIdx(): number {
    return this.$activeFormIdx.value;
  }

  public set activeTabIdx(value: number) {
    this.$activeTabIdx.next(value);

    this.querySettings = {
      sectionFilters: this.sectionConfig.sectionFilters ?? [],
      tabFilters: this.entityConfig.tabFilters ?? []
    };

    localStorage.setItem(
      `${this.sectionConfig.sectionKey}.activeTabIdx`,
      JSON.stringify(value)
    );
  }

  public set activeFormIdx(value: number) {
    if (value < (this.entityConfig.templateSettings ?? []).length) {
      this.$activeFormIdx.next(value);
    } else {
      return;
    }

    // this.querySettings = {
    //   sectionFilters: this.sectionConfig.sectionFilters ?? [],
    //   tabFilters: this.entityConfig.tabFilters ?? []
    // };

    localStorage.setItem(
      `${this.sectionConfig.sectionKey}.activeFormIdx`,
      JSON.stringify(value)
    );
  }









  constructor() {

  }

  public toggleLoading() {
    this.$loading.set(!this.$loading());
  }

  public showLoaderUntilCompleted<T>(obs$: Observable<T>): Observable<T> {
    return of(null)
      .pipe(
        tap(() => { this.loading = true; }),
        concatMap(() => obs$),
        take(1),
        finalize(() => { this.loading = false; })
      );
  }

  public toggleSidenav() {
    this.$sidenavOpened.set(!this.$sidenavOpened());
  }


  public openCrudDialog(dialogData: CrudDialogData) {
    const dialogRef = this.dialog.open(
      CrudDialogComponent, {
      data: dialogData
    });

    const newId = dialogData.newId

    dialogRef.afterClosed()
      .pipe(
        tap(() => this.appService.loadingOn()),
        filter((result: Entity | null) => !!result),
        map((result) => dialogData.onRequest ? dialogData.onRequest(result as Entity) : result as Entity),

        switchMap((entity) => {
          if (dialogData.customRequest$) {
            return this.appService.showLoaderUntilCompleted(dialogData.customRequest$(entity, dialogData));
          }

          switch (dialogData.operation) {
            case 'create': {
              const {
                targetPath,
                subcollections,
                copySubcollectionAttributes,
                pathOverride,
              } = dialogData;

              return this.repository.createEntity$(
                entity,
                this.entityConfig.firestorePath,
                newId,
                pathOverride ?? targetPath,
                subcollections,
                copySubcollectionAttributes
              );
            }
            case 'update': {
              return this.repository.editEntity$(
                entity,
              );
            }
            case 'delete': {
              const {
                markedForDelete,
                subcollections
              } = dialogData;

              return this.repository.removeEntity$(
                entity,
                markedForDelete,
                subcollections
              );
            }
            default:
              throw new Error('Invalid operation.')
          }
        }),

        // finalize(() => this.appService.loadingOff())
      )
      .subscribe({
        next: (entity) => {
          // this.appService.loadingOn();

          dialogData.onResponse?.(entity);

          console.warn(entity)

          const successMessage = `${dialogData.operation} ${this.entityConfig.descriptor} success.`;
          console.log(successMessage);
          this.notificationService.message('Sucess.');
          // this.appService.loadingOff();
        },
        error: (error: Error) => {
          const errorMessage = `${dialogData.operation} ${this.entityConfig.descriptor} error:\n=======\n\n${error.message}`;
          console.error(errorMessage, dialogData);
          this.notificationService.error('Error!');
        },
        complete: () => {
          console.log(`${dialogData.operation} dialog closed...`);
          this.appService.loadingOff();
        }
      });
  }

  public openConfigSheet(sheetData: ConfigSheetData) {
    const sheetRef = this.sheet.open(
      ConfigSheetComponent,
      {
        data: sheetData
      }
    );
  }


  public isDefaultQuery(): boolean {
    const {
      paginator: paginator1,
      tabFilters: tabFilters1,
      sectionFilters: sectionFilters1,
      ...settings1
    } = this.querySettings;

    const {
      paginator: paginator2,
      tabFilters: tabFilters2,
      sectionFilters: sectionFilters2,
      ...settings2
    } = this.entityConfig.querySettings;

    // console.warn(settings1)
    // console.warn(settings2)
    return JSON.stringify(settings1) !== JSON.stringify(settings2);
  }

  public isDefaultTemplateQuery(): boolean {
    const {
      paginator: paginator1,
      tabFilters: tabFilters1,
      sectionFilters: sectionFilters1,
      ...settings1
    } = this.templateSettings;

    const {
      paginator: paginator2,
      tabFilters: tabFilters2,
      sectionFilters: sectionFilters2,
      ...settings2
    } = this.entityConfig.templateSettings![this.$activeFormIdx.value];

    // console.warn('isDefaultTemplateQuery-1', settings1)
    // console.warn('isDefaultTemplateQuery-2', settings2)
    return JSON.stringify(settings1) !== JSON.stringify(settings2);
  }
}
