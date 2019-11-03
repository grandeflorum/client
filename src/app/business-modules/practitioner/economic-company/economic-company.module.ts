import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { EconomicCompanyComponent } from './economic-company.component';
import { Routes, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { CommonComponentModule } from '../../common-component/common-component.module';
import { LayoutModule } from 'src/app/layout/layout.module';
import { EconomicCompanyDetailComponent } from './economic-company-detail/economic-company-detail.component';

const routes: Routes = [
  {
    path: '',
    component: EconomicCompanyComponent
  }, {
    path: 'detail',
    component: EconomicCompanyDetailComponent
  }
];

@NgModule({
  declarations: [EconomicCompanyComponent, EconomicCompanyDetailComponent],
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
export class EconomicCompanyModule { }
