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

}
