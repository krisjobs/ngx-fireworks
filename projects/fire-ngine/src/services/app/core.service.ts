import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class CoreService {
  private _appWidth = signal(0);
  private _loading = signal(false)

  public get loading(): boolean {
    return this._loading();
  }

  public set loading(loading: boolean) {
    this._loading.set(loading);
  }

  public get appWidth(): number {
    return this._appWidth();
  }

  public set appWidth(width: number) {
    this._appWidth.set(width);
  }

  constructor() {

  }

  public toggleLoading() {
    this._loading.set(!this._loading());
  }
}
