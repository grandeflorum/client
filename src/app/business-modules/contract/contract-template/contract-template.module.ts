import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutModule } from '../../../layout/layout.module';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { ContractTemplateComponent } from "./contract-template.component";
import { TemplateDetailComponent } from './template-detail/template-detail.component';
import { TemplateHistoryComponent } from './template-history/template-history.component';
import { ContractContentComponent } from './contract-content/contract-content.component';
import { TradeEditComponent } from './trade-edit/trade-edit.component';

const routes: Routes = [
  {
    path: '',
    component: ContractTemplateComponent
  },
  {
    path: 'detaile',
    component: TemplateDetailComponent
  },
  {
    path: 'history',
    component: TemplateHistoryComponent
  },
  {
    path:"tradeEdit",
    component:TradeEditComponent
  }

];

@NgModule({
  declarations: [ContractTemplateComponent, TemplateDetailComponent, TemplateHistoryComponent, ContractContentComponent, TradeEditComponent],
  imports: [
    CommonModule,
    FormsModule,
    LayoutModule,
    NgZorroAntdModule,
    RouterModule.forChild(routes),
  ],
  exports: [RouterModule],
  entryComponents: [ContractContentComponent]
})
export class ContractTemplateModule { }
