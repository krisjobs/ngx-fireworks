import { ModuleConfig } from "src/app/styleguide";

// ===================== MODULES =====================

export const adminModuleConfig: ModuleConfig = {
  urlSegment: 'users',
  showNavLinksHome: true,
  navLinks: [
    [
      {
        title: 'Users',
        targetUrl: 'users',
        icon: 'people',
      },
      {
        title: 'Cloud Functions',
        targetUrl: 'functions',
        icon: 'cloud_sync',
      }
    ]
  ]
};
