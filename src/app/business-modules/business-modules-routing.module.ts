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
            { path: 'company', loadChildren: () => import('./practitioner/company/company.module').then(m => m.CompanyModule) },
            { path: 'employee', loadChildren: () => import('./practitioner/employee/employee.module').then(m => m.EmployeeModule) },
            { path: 'economic', loadChildren: () => import('./practitioner/economic-company/economic-company.module').then(m => m.EconomicCompanyModule) }

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
            { path: 'kfxmgl', loadChildren: () => import('./xmgl/kfxmgl/kfxmgl.module').then(m => m.KfxmglModule) },
            { path: 'xmscgl', loadChildren: () => import('./xmgl/xmscgl/xmscgl.module').then(m => m.XmscglModule) }
        ]
    },
    {
        path: 'stockHouse',
        component: BusinessModulesComponent,
        canActivate: [AuthGuardService],
        data: { id: 'A-stockHouse' },
        children: [
            { path: '', loadChildren: () => import('./stockHouse/stock-house/stock-house.module').then(m => m.StockHouseModule) }
        ]
    },
    {
        path: 'houserental',
        component: BusinessModulesComponent,
        canActivate: [AuthGuardService],
        data: { id: 'A-houserental' },
        children: [
            { path: '', loadChildren: () => import('./house-rental/houseRental.module').then(m => m.HouseRentalModule) }
        ]
    },
    {
        path: 'lpbgl',
        component: BusinessModulesComponent,
        canActivate: [AuthGuardService],
        data: { id: 'A-xmgl' },
        children: [
            { path: '', loadChildren: () => import('./lpbgl/lpbgl.module').then(m => m.LpbglModule) }
        ]
    },
    {
        path: 'zjgcdygl',
        component: BusinessModulesComponent,
        canActivate: [AuthGuardService],
        data: { id: 'A-zjgcdygl' },
        children: [
            { path: '', loadChildren: () => import('./zjgcdygl/zjgcdygl.module').then(m => m.ZjgcdyglModule) }
        ]
    },
    {
        path: 'ycfgl',
        component: BusinessModulesComponent,
        canActivate: [AuthGuardService],
        data: { id: 'A-ycfgl' },
        children: [
            { path: '', loadChildren: () => import('./ycfgl/ycfgl.module').then(m => m.YcfglModule) }
        ]
    },
    {
        path: 'contract',
        component: BusinessModulesComponent,
        canActivate: [AuthGuardService],
        data: { id: 'A-contract' },
        children: [
            { path: 'contractTemplate', loadChildren: () => import('./contract/contract-template/contract-template.module').then(m => m.ContractTemplateModule) },
            { path: 'houseTrade', loadChildren: () => import('./contract/house-trade/house-trade.module').then(m => m.HouseTradeModule) },
            { path: 'stockTrade', loadChildren: () => import('./contract/stock-trade/stock-trade.module').then(m => m.StockTradeModule) },
            { path: 'cancelRecord', loadChildren: () => import('./contract/cancel-record/cancel-record.module').then(m => m.CancelRecordModule) }
        ]
    },
    {
        path: 'zddygl',
        component: BusinessModulesComponent,
        canActivate: [AuthGuardService],
        data: { id: 'A-zddygl' },
        children: [
            { path: '', loadChildren: () => import('./zddygl/zddygl.module').then(m => m.ZddyglModule) }]
    }, {
        path: 'statistics',
        component: BusinessModulesComponent,
        canActivate: [AuthGuardService],
        data: { id: 'A-statistics' },
        children: [
            { path: 'xsphbfx', loadChildren: () => import('./statistics/xsphbfx/xsphbfx.module').then(m => m.XsphbfxModule) },
            { path: 'sjcxtjfx', loadChildren: () => import('./statistics/sjcxtjfx/sjcxtjfx.module').then(m => m.SjcxtjfxModule) },
            { path: 'jyhzxxfx', loadChildren: () => import('./statistics/jyhzxxfx/jyhzxxfx.module').then(m => m.JyhzxxfxModule) }
        ]
    },
    { path: '', pathMatch: 'full', redirectTo: '/login' }
];

@NgModule({
    imports: [RouterModule.forChild(routes)],
    exports: [RouterModule]
})
export class BusinessModulesRoutingModule { }
