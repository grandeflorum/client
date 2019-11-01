import { Injectable, OnInit } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';

@Injectable({providedIn:'root'})
export class HttpRestService {
    constructor(private _httpClient: HttpClient) {}

    
    get<T>(url){
        url = AppConfig.Configuration.baseUrl + url;
        return  this._httpClient.get<T>( url,{withCredentials: false}).toPromise()
        .catch(ex => {
          let t: T;
          return t;
          }) ; 
      }

      post<T>(url ,data) {
        url = AppConfig.Configuration.baseUrl + url;
        return  this._httpClient.post<T>( url, data ,{withCredentials: false}).toPromise()
        .catch(ex => {
            let t: T;
            return t;
        });  
        }  



    down(url){
        url = AppConfig.Configuration.baseUrl + url;
        return  this._httpClient.get( url,{withCredentials: false}).toPromise() ; 
    }
    


}


