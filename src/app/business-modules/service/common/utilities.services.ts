import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpRestService } from '../http-rest.service';

@Injectable({
    providedIn: 'root'
})
export class UtilitiesSercice {




    constructor(private http: HttpRestService) { }

    wrapUrl(url): any {
        
        let authID = sessionStorage.getItem('AUTH_ID');
        var p = 'AUTH_ID=' + encodeURIComponent(authID);
        if (url.indexOf('?') >= 0) {
            url += '&' + p;
        }
        else {
            url += '?' + p;
        }
        return url;
    }





}
