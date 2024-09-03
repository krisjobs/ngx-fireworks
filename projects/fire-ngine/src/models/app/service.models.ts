import { Signal } from "@angular/core";
import { Entity } from "../../common/models";


export enum LogLevel {
  DEBUG,
  INFO,
  WARN,
  ERROR,
};

export type ContextMap = Map<string, Signal<Entity>>;
