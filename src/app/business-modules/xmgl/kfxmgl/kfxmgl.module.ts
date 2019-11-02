import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { LayoutModule } from '../../../layout/layout.module';
import { KfxmglComponent} from './kfxmgl.component';
import { KfxmglDetailComponent } from './detail/kfxmgl-detail.component';
import { NgZorroAntdModule } from 'ng-zorro-antd';

const routes: Routes = [
    {
        path: '',
        component: KfxmglComponent
    },
    {
        path: 'detail',
        component: KfxmglDetailComponent
    }
];

@NgModule({
    declarations: [
        KfxmglComponent,
        KfxmglDetailComponent
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
export class KfxmglModule { }
