import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutModule } from '../../../layout/layout.module';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { HouseTradeComponent } from "./house-trade.component";

const routes: Routes = [
  {
    path: '',
    component: HouseTradeComponent
  }
];

@NgModule({
  declarations: [HouseTradeComponent],
  imports: [
    CommonModule,
    FormsModule,
    LayoutModule,
    NgZorroAntdModule,
    RouterModule.forChild(routes),
  ],
  exports: [RouterModule]
})
export class HouseTradeModule { }
