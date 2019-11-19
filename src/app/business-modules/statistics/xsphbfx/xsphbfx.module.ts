import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { LayoutModule } from '../../../layout/layout.module';
import { XsphbfxComponent } from './xsphbfx.component';
import { NgZorroAntdModule } from 'ng-zorro-antd';

const routes: Routes = [
    {
        path: '',
        component: XsphbfxComponent
    }
];

@NgModule({
    declarations: [XsphbfxComponent],
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
export class XsphbfxModule { }
