import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { LayoutModule } from '../../layout/layout.module';
import { LpbglComponent } from './lpbgl.component';
import { LpbglDetailComponent } from './detail/lpbgl-detail.component';
import { NgZorroAntdModule } from 'ng-zorro-antd';

const routes: Routes = [
    {
        path: '',
        component: LpbglComponent
    },
    {
        path: 'detail',
        component: LpbglDetailComponent
    }
];

@NgModule({
    declarations: [],
    imports: [
        CommonModule,
        FormsModule,
        LayoutModule,
        NgZorroAntdModule,
        RouterModule.forChild(routes)
    ],
    exports: [RouterModule],
    entryComponents: [
        LpbglDetailComponent
    ]
})
export class LpbglModule { }
