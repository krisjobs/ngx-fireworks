import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { Component, Input, OnInit } from '@angular/core';
import { combineLatest, map } from 'rxjs';
import { DashboardLayout } from 'src/app/styleguide';


@Component({
  selector: 'fng-dashboard-view',
  standalone: true,
  templateUrl: './dashboard-view.component.html',
  styleUrls: ['./dashboard-view.component.scss']
})
export class DashboardViewComponent implements OnInit {

  @Input()
  public layout!: DashboardLayout;

  /** Based on the screen size, switch from standard to one column per row */
  public numCols$ = combineLatest([
    this.breakpointObserver.observe(Breakpoints.Handset),
    this.breakpointObserver.observe(Breakpoints.Large),
  ])
    .pipe(
      map(([{ matches: matchesHandset }, { matches: matchesLarge }]) => {
        if (matchesHandset) {
          return 1;
        } else if (matchesLarge) {
          return 3
        } else {
          return 2;
        }
      }),
    );

  /** Based on the screen size, switch from standard to one column per row */
  public playerWidth$ = combineLatest([
    this.breakpointObserver.observe(Breakpoints.Handset),
    this.breakpointObserver.observe(Breakpoints.Large),
  ])
    .pipe(
      map(([{ matches: matchesHandset }, { matches: matchesLarge }]) => {
        if (matchesHandset) {
          return 300;
        } else if (matchesLarge) {
          return 900
        } else {
          return 600;
        }
      }),
    );

  constructor(
    private breakpointObserver: BreakpointObserver,

  ) { }

  ngOnInit(): void {
    console.warn(this.layout)
  }

}
