import { Component, OnInit } from '@angular/core';
import { AppService } from 'src/app/styleguide/services/app.service';
import { FunctionsService } from '../../../firebase/services/functions.service';

@Component({
  selector: 'lib-user-settings',
  templateUrl: './user-settings.component.html',
  styleUrls: ['./user-settings.component.scss']
})
export class UserSettingsComponent implements OnInit {

  panelOpenState = false;

  constructor(
    private appService: AppService,
    private functionsService: FunctionsService,

  ) {
  }

  ngOnInit(): void {
  }

  public clearLocalStorage() {
    this.appService.resetLocalStorage();
  }

  public dump() {
    this.functionsService.callFunction$('dumpFirestore')
    console.log("j")
  }
}
