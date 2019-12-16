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

    getTimeStamp(): any {
        var CurrentDate = new Date();
        var Year = CurrentDate.getFullYear();
        var Month = CurrentDate.getMonth() + 1;
        var Day = CurrentDate.getDate();
        var hour = CurrentDate.getHours();
        var min = CurrentDate.getMinutes();
        var sec = CurrentDate.getSeconds();
        var millSec = CurrentDate.getMilliseconds();
        var result = Year.toString() + this.WarpTime(Month) + this.WarpTime(Day) + this.WarpTime(hour) + this.WarpTime(min) + this.WarpTime(sec) + this.WarpMilliTime(millSec);
        return result;
    }

    WarpTime(date) {
        if (date < 10) {
            date = "0" + date;
        }
        return date.toString();
    }

    WarpMilliTime(date) {
        date = date.toString()
        if (date.length == 1) {
            date = "000" + date;
        } else if (date.length == 2) {
            date = "00" + date;
        } else if (date.length == 3) {
            date = "0" + date;
        }
        return date;
    }





}
