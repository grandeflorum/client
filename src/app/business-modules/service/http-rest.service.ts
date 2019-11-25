import { Injectable, OnInit } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class HttpRestService {

    AUTH_ID: string;
    headers: HttpHeaders;

    constructor(private _httpClient: HttpClient) {

    }

    getHeader() {
        this.AUTH_ID = sessionStorage.getItem('AUTH_ID');
        if (this.AUTH_ID) {
            this.headers = new HttpHeaders({ 'AUTH_ID': this.AUTH_ID });
        } else {
            this.headers = new HttpHeaders();
        }
    }

    get<T>(url) {
        this.getHeader();
        url = AppConfig.Configuration.baseUrl + url;
        return this._httpClient.get<T>(url, { withCredentials: false, headers: this.headers }).toPromise()
            .catch(ex => {
                let t: T;
                return t;
            });
    }

    post<T>(url, data) {
        this.getHeader();
        url = AppConfig.Configuration.baseUrl + url;
        return this._httpClient.post<T>(url, data, { withCredentials: false, headers: this.headers }).toPromise()
            .catch(ex => {
                let t: T;
                return t;
            });
    }



    down(url) {
        url = AppConfig.Configuration.baseUrl + url;
        return this._httpClient.get(url, { withCredentials: false }).toPromise();
    }



}


