import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NotFoundComponent } from './not-found/not-found.component';
import { EwmCheckComponent } from './ewm-check/ewm-check.component';
import { ContractQueryComponent } from './contract-query/contract-query.component';

const routes: Routes = [
  { path: '', loadChildren: () => import('./business-modules/business-modules.module').then(m => m.BusinessModulesModule) },
  { path: 'login', loadChildren: () => import('./login/login.module').then(m => m.LoginModule) },
  { path: 'ewmcheck', component: EwmCheckComponent},
  { path: 'contractquery', component: ContractQueryComponent},
  { path: '**', component: NotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
