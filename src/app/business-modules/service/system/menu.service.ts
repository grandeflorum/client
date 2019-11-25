import { Injectable } from '@angular/core';
import { HttpRestService } from '../http-rest.service';

@Injectable({
  providedIn: 'root'
})
export class MenuService {
  constructor(private http: HttpRestService) { }

  getAllMenu(): any {
    return this.http.post('/SystemMenu/getAllMenu', null);
  }

  saveOrUpdateMenu(param): any {
    let url = !param.id ? '/SystemMenu/addMenu' : '/SystemMenu/modifyMenu';
    return this.http.post(url, param);
  }

  deleteMenuByIds(ids): any {
    return this.http.post('/SystemMenu/deleteMenuByIds', ids);
  }

  getUserMenu(): any {
    return this.http.post('/SystemMenu/getUserMenu', null);
  }

}
