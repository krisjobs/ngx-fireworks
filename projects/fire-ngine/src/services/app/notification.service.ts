import { Injectable } from '@angular/core';
import { MatSnackBar } from "@angular/material/snack-bar";

// ===================== DEFINITIONS =====================

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor(
    private snackBar: MatSnackBar
  ) { }

  public message(
    message: string,
    action: string = 'OK'
  ) {
    let config: any = {

      duration: 10000,
      panelClass: ['message-snackbar']
    };
    this.snackBar.open(message, action, config);
  }

  public error(
    message: string,
    action: string = 'Close'
  ) {
    let config: any = {

      panelClass: ['error-snackbar']
    };
    this.snackBar.open(message, action, config);
  }

  public throwErrorIfNotExist<T>(message: string, object?: T | null, context?: any): T {
    if (!object) {
      console.error(message, context);
      // this.notificationService.error(message);
      // this.router.navigateByUrl('/');
      throw new Error(message);
    }

    return object;
  }

  public throwError(message: string, context?: any): never {
    this.error(message);
    console.error(message, context);
    throw new Error(message);
  }
}
