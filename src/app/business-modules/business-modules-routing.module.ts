import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { BusinessModulesComponent } from './business-modules.component';
import { AuthGuardService } from './service/auth-guard.service';


const routes: Routes = [
    {
        path: 'home',
        component: BusinessModulesComponent,
        canActivate: [AuthGuardService],
        data: { id: 'A-home' },
        children: [
            { path: '', loadChildren: () => import('./home/home.module').then(m => m.HomeModule) }
        ]
    },
    {
        path: 'practitioner',
        component: BusinessModulesComponent,
        canActivate: [AuthGuardService],
        data: { id: 'A-practitioner' },
        children: [
            { path: 'company', loadChildren: () => import('./practitioner/company/company.module').then(m => m.CompanyModule) }
          
        ]
    },
    {
        path: 'system',
        component: BusinessModulesComponent,
        canActivate: [AuthGuardService],
        data: { id: 'A-system' },
        children: [
            { path: 'organization', loadChildren: () => import('./system/organization/organization.module').then(m => m.OrganizationModule) },
            { path: 'user', loadChildren: () => import('./system/user/user.module').then(m => m.UserModule) },
            { path: 'role', loadChildren: () => import('./system/role/role.module').then(m => m.RoleModule) },
            { path: 'menu', loadChildren: () => import('./system/menu/menu.module').then(m => m.MenuModule) }
        ]
    },
    {
        path: 'xmgl',
        component: BusinessModulesComponent,
        canActivate: [AuthGuardService],
        data: { id: 'A-xmgl' },
        children: [
            { path: 'kfxmgl', loadChildren: () => import('./xmgl/kfxmgl/kfxmgl.module').then(m => m.KfxmglModule) }
        ]
    },
    { path: '', pathMatch: 'full', redirectTo: '/home' }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class BusinessModulesRoutingModule { }
