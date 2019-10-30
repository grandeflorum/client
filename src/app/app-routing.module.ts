import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { NotFoundComponent } from './not-found/not-found.component';

const routes: Routes = [
    { path: '', loadChildren: () => import('./business-modules/business-modules.module').then(m => m.BusinessModulesModule)},
    { path: 'login', loadChildren: () => import('./login/login.module').then(m => m.LoginModule)},
    { path: '**', component: NotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }