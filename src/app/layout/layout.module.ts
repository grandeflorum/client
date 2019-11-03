import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { NgZorroAntdModule } from 'ng-zorro-antd';
import { NgxEchartsModule } from 'ngx-echarts';
import { ValidationDirective } from './_directives/validation.directive';
import { PageHeightDrective } from './_directives/pageHeightDrective';
import { AuditPipe } from './_pipes/audit.pipe';
import { uploadComponent } from './_components/upload/upload.component';

@NgModule({
    imports: [
        CommonModule,
        RouterModule,
        FormsModule,
        ReactiveFormsModule,
        NgZorroAntdModule,
        NgxEchartsModule
    ],
    declarations: [ValidationDirective, PageHeightDrective, uploadComponent, AuditPipe],
    exports: [ValidationDirective, PageHeightDrective, uploadComponent, AuditPipe, NgxEchartsModule],
    providers: [],
    entryComponents: []
})
export class LayoutModule { }
