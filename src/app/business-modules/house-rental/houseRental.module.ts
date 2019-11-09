import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { LayoutModule } from '../../layout/layout.module';
import { HouseRentalComponent } from './house-rental.component'
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { HouseRentalDetailComponent } from './house-rental-detail/house-rental-detail.component';

const routes: Routes = [
    {
        path: '',
        component: HouseRentalComponent
    }, {
        path: 'detail',
        component: HouseRentalDetailComponent
    }
];

@NgModule({
    declarations: [
        HouseRentalComponent,
        HouseRentalDetailComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        LayoutModule,
        NgZorroAntdModule,
        RouterModule.forChild(routes)
    ],
    exports: [RouterModule],
    entryComponents: []
})
export class HouseRentalModule { }
