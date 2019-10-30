import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Routes, RouterModule } from '@angular/router';
import { LayoutModule } from '../../layout/layout.module';
import { HomeComponent} from './home.component';
const routes: Routes = [
    {
        path: '',
        component: HomeComponent
    }
];

@NgModule({
    declarations: [
        HomeComponent
    ],
    imports: [
        CommonModule,
        FormsModule, 
        RouterModule.forChild(routes),
        LayoutModule
    ],
    exports: [RouterModule],
    entryComponents: []
})
export class HomeModule { }
