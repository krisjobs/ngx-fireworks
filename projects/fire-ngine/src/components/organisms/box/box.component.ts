import { AfterViewInit, Component, ElementRef, Inject, Input, OnDestroy, OnInit, QueryList, ViewChildren } from '@angular/core';
import { map, Observable, of, tap } from 'rxjs';
import { MODULE_CONFIG } from 'src/app/styleguide/services/app.providers';
import { AppService } from 'src/app/styleguide/services/app.service';
import { DashboardBox, ModuleConfig, BoxSegment } from 'src/app/styleguide';


@Component({
  selector: 'fng-box',
  standalone: true,
  templateUrl: './box.component.html',
  styleUrls: ['./box.component.scss']
})
export class BoxComponent implements OnInit, AfterViewInit, OnDestroy {

  @Input()
  public box!: DashboardBox;

  @ViewChildren("supportButton", { read: ElementRef })
  private supportButtonRefs!: QueryList<ElementRef>;

  public breakpointValue$: Observable<any> = of(1);
  public altBreakpointValue$!: Observable<any>;
  public boxWidth$!: Observable<any>;
  public width$!: Observable<any>;

  public get mainSegment(): BoxSegment {
    return this.box.segments[0];
  }

  public currentUrl$ = this.appService.currentUrl$;

  constructor(
    @Inject(MODULE_CONFIG) private moduleConfig: ModuleConfig,
    private appService: AppService,
  ) { }

  ngOnInit(): void {
    if (this.box.breakpoints && this.box.breakpointValues) {
      this.breakpointValue$ = this.appService.breakpointObserver$(
        this.box.breakpoints,
        this.box.breakpointValues
      ).pipe(
        // tap(console.warn)
      );
    }

    if (this.box.altBreakpoints && this.box.altBreakpointValues) {
      this.altBreakpointValue$ = this.appService.breakpointObserver$(
        this.box.altBreakpoints,
        this.box.altBreakpointValues
      ).pipe(
        // tap(console.warn)
      );
    }

    if (this.box.widthBreakpoints && this.box.widthValues) {
      this.boxWidth$ = this.appService.breakpointObserver$(
        this.box.widthBreakpoints,
        this.box.widthValues
      ).pipe(
        map(width => ({
          width
        })),
        // tap(console.warn)
      );

      this.width$ = this.appService.breakpointObserver$(
        this.box.widthBreakpoints,
        this.box.widthValues
      ).pipe(
        tap(console.warn)
      );
    }
  }

  ngAfterViewInit(): void {
    if (this.box.type === 'header') {
      this.box.segments[3]?.mediaUrls?.forEach(
        (url, idx) => this.supportButtonRefs.get(idx)?.nativeElement?.style.setProperty('--logo-image-url', `url("${url}")`)
      );
    }
  }

  ngOnDestroy(): void {
  }

  public isListItem(paragraph: string) {
    return paragraph.startsWith('- ');
  }

  public customizeText(paragraph: string, asListItem = false) {
    let newText = paragraph;

    if (asListItem) {
      newText = newText.slice(2);
    }

    newText = newText.replace('->', '\u2192');

    return newText;
  }

  public openSocial(url?: string) {
    if (!!url) {
      window.open(url, '_blank');
    }
  }
}
