import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { LayoutModule } from '../../../layout/layout.module';
import { CompanyComponent } from './company.component';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { CompanyDetailComponent } from './company-detail/company-detail.component';
import { CommonComponentModule } from '../../common-component/common-component.module';

const routes: Routes = [
    {
        path: '',
        component: CompanyComponent
    }, {
        path: 'detail',
        component: CompanyDetailComponent
    }
];

@NgModule({
    declarations: [
        CompanyComponent,
        CompanyDetailComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        LayoutModule,
        NgZorroAntdModule,
        RouterModule.forChild(routes),
        CommonComponentModule
    ],
    exports: [RouterModule],
    entryComponents: []
})
export class CompanyModule { }
