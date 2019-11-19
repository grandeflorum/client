import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ZddyglComponent } from './zddygl/zddygl.component';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { LayoutModule } from '../../layout/layout.module';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { ZddyglDetailComponent } from './zddygl-detail/zddygl-detail.component';
import { LpbglDetailComponent } from '../lpbgl/detail/lpbgl-detail.component';


const routes: Routes = [
  {
    path: '',
    component: ZddyglComponent
  }, {
    path: 'detail',
    component: ZddyglDetailComponent
  },
  {
    path: 'lpbdetail',
    component: LpbglDetailComponent
  }
];


@NgModule({
  declarations: [ZddyglComponent, ZddyglDetailComponent],
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
export class ZddyglModule { }
