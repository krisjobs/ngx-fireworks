import { Component, OnInit } from '@angular/core';
import { tap } from 'rxjs';
import { AppService } from 'src/app/styleguide/services/app.service';

@Component({
  selector: 'lib-loading',
  templateUrl: './loading.component.html',
  styleUrls: ['./loading.component.scss']
})
export class LoadingComponent implements OnInit {

  public loading$ = this.appService.loading$;

  constructor(
    private appService: AppService,
  ) { }

  ngOnInit(): void {
  }

}
