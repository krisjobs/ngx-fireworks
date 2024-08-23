import { Inject, Injectable } from '@angular/core';
import { APP_CONFIG, AppConfig } from 'fire-ngine';
import { LogLevel } from '../../models';


@Injectable({
  providedIn: 'root'
})
export class LoggerService {

  // TODO> define context type
  private context: any;

  private get currentLevel(): LogLevel {
    // TODO> read from config
    return LogLevel.DEBUG;
  }

  constructor(
    @Inject(APP_CONFIG) private config: AppConfig,
  ) {
    this.context = {
      appTitle: this.config.appTitle
    };
  }

  public debug(message: string, context: any = {}): void {
    context = {
      ...this.context,
      context
    };

    if (this.currentLevel >= LogLevel.DEBUG) {
      console.warn(`---> $ <DEBUG> ${message}`, context);
    }
  }

  public log(message: string, context: any = {}): void {
    context = {
      ...this.context,
      context
    };

    if (this.currentLevel >= LogLevel.INFO) {
      console.log(`---> $ <INFO> ${message}`, context);
    }
  }

  public warn(message: string, context: any = {}): void {
    context = {
      ...this.context,
      context
    };

    if (this.currentLevel >= LogLevel.WARN) {
      console.warn(`---> $ <WARN> ${message}`, context);
    }
  }

  public error(message: string, context: any = {}): void {
    context = {
      ...this.context,
      context
    };

    if (this.currentLevel >= LogLevel.ERROR) {
      console.error(`---> $ <ERROR> ${message}`, context);
    }
  }
}
