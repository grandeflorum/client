import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutModule } from '../../../layout/layout.module';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { StockTradeComponent } from "./stock-trade.component";
import { StockTradeDetailComponent } from './detail/stock-trade-detail.component';

const routes: Routes = [
  {
    path: '',
    component: StockTradeComponent
  },
  {
    path: 'detail',
    component: StockTradeDetailComponent
  }
];

@NgModule({
  declarations: [StockTradeComponent , StockTradeDetailComponent],
  imports: [
    CommonModule,
    FormsModule,
    LayoutModule,
    NgZorroAntdModule,
    RouterModule.forChild(routes),
  ],
  exports: [RouterModule]
})
export class StockTradeModule { }
