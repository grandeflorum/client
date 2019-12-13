import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutModule } from '../layout/layout.module';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';

import { EwmCheckComponent } from './ewm-check.component';

const routes: Routes = [
  {
    path: '',
    component: EwmCheckComponent
  }
];

@NgModule({
  declarations: [EwmCheckComponent],
  imports: [
    CommonModule,
    FormsModule,
    LayoutModule,
    NgZorroAntdModule,
    RouterModule.forChild(routes),
  ],
  exports: [RouterModule],
  entryComponents: [EwmCheckComponent]
})
export class EwmCheckModule { }
