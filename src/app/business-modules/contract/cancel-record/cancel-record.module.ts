import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutModule } from '../../../layout/layout.module';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { CancelRecordComponent } from "./cancel-record.component";


const routes: Routes = [
  {
    path: '',
    component: CancelRecordComponent
  }
];

@NgModule({
  declarations: [CancelRecordComponent],
  imports: [
    CommonModule,
    FormsModule,
    LayoutModule,
    NgZorroAntdModule,
    RouterModule.forChild(routes),
  ],
  exports: [RouterModule]
})
export class CancelRecordModule { }
