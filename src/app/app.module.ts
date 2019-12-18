import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppRoutingModule } from './app-routing.module';
import { LayoutModule } from './layout/layout.module';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AppComponent } from './app.component';
import { NZ_I18N, zh_CN } from 'ng-zorro-antd';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { registerLocaleData, LocationStrategy, HashLocationStrategy } from '@angular/common';
import zh from '@angular/common/locales/zh';
import { IconsProviderModule } from './icons-provider.module';

//service
import { AuthGuardService } from './business-modules/service/auth-guard.service';
import { ExceptionInterceptorService } from './business-modules/service/exception-interceptor.service';

//component
import { NotFoundComponent } from './not-found/not-found.component';
import { EwmCheckComponent } from './ewm-check/ewm-check.component';

registerLocaleData(zh);

@NgModule({
  declarations: [
    AppComponent,
    NotFoundComponent,
    EwmCheckComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    LayoutModule,
    FormsModule,
    HttpClientModule,
    BrowserAnimationsModule,
    IconsProviderModule,
    ReactiveFormsModule
  ],
  providers: [
    { provide: LocationStrategy, useClass: HashLocationStrategy },
    { provide: HTTP_INTERCEPTORS, useClass: ExceptionInterceptorService, multi: true },
    { provide: NZ_I18N, useValue: zh_CN },
    AuthGuardService
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
