import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NotFoundComponent } from './not-found/not-found.component';
import { EwmCheckModule } from './ewm-check/ewm-check.module';

const routes: Routes = [
  { path: '', loadChildren: () => import('./business-modules/business-modules.module').then(m => m.BusinessModulesModule) },
  { path: 'login', loadChildren: () => import('./login/login.module').then(m => m.LoginModule) },
  { path: 'ewmcheck', loadChildren: () => import('./ewm-check/ewm-check.module').then(m => EwmCheckModule) },
  { path: '**', component: NotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
