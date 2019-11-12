import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutModule } from '../../../layout/layout.module';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { HouseTradeComponent } from "./house-trade.component";
import { HouseTradeDetailComponent } from './detail/house-trade-detail.component';

const routes: Routes = [
  {
    path: '',
    component: HouseTradeComponent
  },
  {
    path: 'detail',
    component: HouseTradeDetailComponent
  }
];

@NgModule({
  declarations: [HouseTradeComponent , HouseTradeDetailComponent],
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
