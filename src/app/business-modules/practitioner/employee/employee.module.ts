import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmployeeComponent } from './employee.component';
import { FormsModule } from '@angular/forms';
import { LayoutModule } from '../../../layout/layout.module';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { RouterModule, Routes } from '@angular/router';
import { EmployeeDetailComponent } from './employee-detail/employee-detail.component';
import { CommonComponentModule } from '../../common-component/common-component.module';

const routes: Routes = [
  {
    path: '',
    component: EmployeeComponent
  },
  {
    path: 'detail',
    component: EmployeeDetailComponent
  }
];

@NgModule({
  declarations: [
    EmployeeComponent,
    EmployeeDetailComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    LayoutModule,
    NgZorroAntdModule,
    RouterModule.forChild(routes),
    CommonComponentModule
  ],
  exports: [RouterModule],
  entryComponents: []
})
export class EmployeeModule { }
