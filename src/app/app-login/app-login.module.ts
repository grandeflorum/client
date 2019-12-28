import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { AppLoginComponent } from './app-login.component';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { LayoutModule } from '../layout/layout.module';

const routes: Routes = [
    {
        path: '',
        component: AppLoginComponent
    }
];

@NgModule({
    declarations: [
        AppLoginComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        ReactiveFormsModule,
        NgZorroAntdModule,
        LayoutModule,
        RouterModule.forChild(routes)
    ],
    exports: [RouterModule],
    entryComponents: []
})
export class AppLoginModule { }
