import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { BusinessModulesComponent } from './business-modules.component';
import { BusinessModulesRoutingModule } from './business-modules-routing.module';
import { FormsModule , ReactiveFormsModule } from '@angular/forms';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { LayoutModule } from '../layout/layout.module';
@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        BusinessModulesRoutingModule,
        FormsModule,
        ReactiveFormsModule,
        LayoutModule,
        NgZorroAntdModule
     ],
    declarations: [BusinessModulesComponent],
})
export class BusinessModulesModule { }