import { Injectable } from '@angular/core';
import { HttpRestService } from '../http-rest.service';

@Injectable({
  providedIn: 'root'
})
export class ZddyglService {

  constructor(private http: HttpRestService) { }

  getZddyglList(data): any {
    return this.http.post('/Zddy/getZddyList', data);
  }

  SaveOrUpdateZddygl(data): any {
    return this.http.post('/Zddy/saveOrUpdateZddy', data);
  }

  getZddyglById(id): any {
    return this.http.get('/Zddy/getZddyById?id=' + id);
  }

  deleteZddyglByIds(data): any {
    return this.http.post('/Zddy/deleteZddyByIds', data);
  }

  linkDyxxByBdcdyh(id, bdcdyh): any {
    return this.http.get('/Zddy/linkDyxxByBdcdyh?id=' + id + '&bdcdyh=' + bdcdyh);
  }

  restrictedProperty(id, zh, type): any {
    return this.http.get('/Zddy/restrictedProperty?id=' + id + '&zh=' + zh + '&type=' + type);
  }

  updateZddyTypeById(id, type: number): any {
    return this.http.get('/Zddy/updateZddyTypeById?id=' + id + '&type=' + type);
  }


}
