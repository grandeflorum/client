import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { LayoutModule } from '../../layout/layout.module';
import { ZjgcdyglComponent } from './zjgcdygl.component';
import { LpbglDetailComponent } from '../lpbgl/detail/lpbgl-detail.component';
import { NgZorroAntdModule } from 'ng-zorro-antd';

const routes: Routes = [
    {
        path: '',
        component: ZjgcdyglComponent
    },
    {
        path: 'detail',
        component: LpbglDetailComponent
    }
];

@NgModule({
    declarations: [
        ZjgcdyglComponent
    ],
    imports: [
        CommonModule,
        FormsModule, 
        LayoutModule,
        NgZorroAntdModule,
        RouterModule.forChild(routes)
        
    ],
    exports: [RouterModule],
    entryComponents: []
})
export class ZjgcdyglModule { }
