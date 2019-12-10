import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHeaderResponse, HttpProgressEvent, HttpResponse, HttpUserEvent, HttpSentEvent, HttpHandler } from '@angular/common/http';
import { Observable } from 'rxjs';
import { catchError , tap } from 'rxjs/operators';
import { NzMessageService } from 'ng-zorro-antd';

@Injectable()
export class ExceptionInterceptorService implements HttpInterceptor {

    constructor(
        private msg:NzMessageService
    ) { }

    intercept(req: HttpRequest<any>, next: HttpHandler):
        Observable<HttpSentEvent | HttpHeaderResponse | HttpProgressEvent | HttpResponse<any> | HttpUserEvent<any>> {
        //console.log('interceptor');
        const jwtReq = req.clone();
        return next
            .handle(jwtReq)
            .pipe(
                tap(
                    (event: any) => {
                        if (event instanceof HttpResponse&& event.body && event.body.code !== 0) {
                            return Observable.create(observer => observer.error(event));
                        }
                        return Observable.create(observer => observer.next(event));
                    }
                ), catchError((res: HttpResponse<any>) => {
                
                    switch (res.status) {
                        case 401:
                            location.href = ''; 
                            break;
                        case 403:
                            this.msg.error('当前用户已失效，请重新登录', {
                                nzDuration: 6000
                              }); 
                            break;
                        case 500:
                        console.log(`errorCode:500,错误代码为：${res.body.code}`)
                            break;
                        case 404:
                        console.log('errorCode:404,服务API不存在')
                            break;
                    }
                    // 以错误的形式结束本次请求
                    return Observable.throw(res);
                })
               )
    }
}
