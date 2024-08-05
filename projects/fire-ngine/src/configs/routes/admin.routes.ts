import { Routes } from "@angular/router";
import { ModuleComponent } from "../../components/templates/module/module.component";

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    component: ModuleComponent,
    redirectTo: 'backoffice',
    children: [
      {
        path: 'backoffice',
        loadComponent: () => import('../../components/templates/data-view/data-view.component')
          .then(m => m.DataViewComponent),
      }
    ]
  },
]
