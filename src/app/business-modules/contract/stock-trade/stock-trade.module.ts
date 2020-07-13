/*
 * @Author: your name
 * @Date: 2020-01-13 13:11:00
 * @LastEditTime: 2020-03-10 21:31:34
 * @LastEditors: your name
 * @Description: In User Settings Edit
 * @FilePath: \client\src\app\business-modules\contract\stock-trade\stock-trade.module.ts
 */
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LayoutModule } from '../../../layout/layout.module';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { StockTradeComponent } from './stock-trade.component';
import { StockTradeDetailComponent } from './detail/stock-trade-detail.component';
import { LpbglDetailComponent } from '../../lpbgl/detail/lpbgl-detail.component';


const routes: Routes = [
  {
    path: '',
    component: StockTradeComponent
  },
  {
    path: 'detail',
    component: StockTradeDetailComponent
  },
  {
      path: 'lpbdetail',
      component: LpbglDetailComponent
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
