import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BusinessModulesComponent } from './business-modules.component';
import { AuthGuardService } from './service/auth-guard.service';


const routes: Routes = [
    {
        path: 'home',
        component: BusinessModulesComponent,
        // canActivate: [AuthGuardService],
        data: { id: 'A-home' },
        children: [
            { path: '', loadChildren: () => import('./home/home.module').then(m => m.HomeModule) }
        ]
    },
    { path: '', pathMatch: 'full', redirectTo: '/home' }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class BusinessModulesRoutingModule { }
