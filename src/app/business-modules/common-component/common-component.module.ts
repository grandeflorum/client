import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EmployeeListComponent } from './employee-list/employee-list.component';
import { FormsModule } from '@angular/forms';
import { LayoutModule } from '../../layout/layout.module';
import { NgZorroAntdModule } from 'ng-zorro-antd';


@NgModule({
  declarations: [
    EmployeeListComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    LayoutModule,
    NgZorroAntdModule,
  ],
  exports: [EmployeeListComponent]
})
export class CommonComponentModule { }
