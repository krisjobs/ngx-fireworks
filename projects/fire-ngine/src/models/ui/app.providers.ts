import { InjectionToken } from "@angular/core";

// ===================== MODELS =====================

import { AppConfig, ModuleConfig, SectionConfig } from "src/app/styleguide";

// ===================== DEFINITIONS =====================

export const APP_CONFIG = new InjectionToken<AppConfig>('appConfig');

export const MODULE_CONFIG = new InjectionToken<ModuleConfig>('moduleConfig');

export const SECTION_CONFIG = new InjectionToken<SectionConfig>('sectionConfig');
