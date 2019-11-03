import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { LayoutModule } from '../../../layout/layout.module';
import { XmscglComponent } from './xmscgl.component';
import { NgZorroAntdModule } from 'ng-zorro-antd';

const routes: Routes = [
    {
        path: '',
        component: XmscglComponent
    }

];

@NgModule({
    declarations: [
        XmscglComponent
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
export class XmscglModule { }
