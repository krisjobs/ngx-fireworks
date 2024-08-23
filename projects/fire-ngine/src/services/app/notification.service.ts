import { Inject, Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from "@angular/material/snack-bar";

import { APP_CONFIG, AppConfig } from '../../models';
import { LoggerService } from './logger.service';

// ===================== DEFINITIONS =====================

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  private get duration(): number {
    return this.appConfig.snackbarDuration;
  }

  constructor(
    @Inject(APP_CONFIG) private appConfig: AppConfig,
    private logger: LoggerService,
    private snackBar: MatSnackBar
  ) { }

  public info(
    message: string,
    context: any = {},
  ) {
    const action = 'OK';
    const config: MatSnackBarConfig = {
      duration: this.duration,
    };

    this.snackBar.open(message, action, config);
    this.logger.log(message, context);
  }

  public warn(
    message: string,
    context: any = {},
  ) {
    const action = 'Close';
    const config: MatSnackBarConfig = {
      duration: this.duration,
    };

    this.snackBar.open(message, action, config);
    this.logger.warn(message, context);
  }

  public error(
    message: string,
    context: any = {},
  ) {
    const action = 'Dismiss';
    const config: MatSnackBarConfig = {
      duration: this.duration,
    };

    this.snackBar.open(message, action, config);
    this.logger.error(message, context);
  }
}
