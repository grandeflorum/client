import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { StockHouseComponent } from "./stock-house.component";
import { LayoutModule } from '../../../layout/layout.module';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { StockHouseDetailComponent } from './detail/stock-house-detail.component';

const routes: Routes = [
  {
    path: '',
    component: StockHouseComponent
  },
  {
    path: 'detail',
    component: StockHouseDetailComponent
  }
];

@NgModule({
  declarations: [
    StockHouseComponent,
    StockHouseDetailComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    LayoutModule,
    NgZorroAntdModule,
    RouterModule.forChild(routes),

  ],
  exports: [RouterModule],
  entryComponents: []
})
export class StockHouseModule { }
