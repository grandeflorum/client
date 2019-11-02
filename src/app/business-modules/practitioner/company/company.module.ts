import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { LayoutModule } from '../../../layout/layout.module';
import { CompanyComponent} from './company.component';
import { NgZorroAntdModule } from 'ng-zorro-antd';

const routes: Routes = [
    {
        path: '',
        component: CompanyComponent
    }
];

@NgModule({
    declarations: [
        CompanyComponent
    ],
    imports: [
        CommonModule,
        FormsModule, 
        LayoutModule,
        NgZorroAntdModule,
        RouterModule.forChild(routes),   
    ],
    exports: [RouterModule],
    entryComponents: []
})
export class CompanyModule { }
