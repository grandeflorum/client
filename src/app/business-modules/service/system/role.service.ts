import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { HttpRestService } from '../http-rest.service';

@Injectable({
  providedIn: 'root'
})
export class RoleService {
  constructor(private http: HttpRestService) {}

  getRoleList(param): any {
    return this.http.post('/SystemRole/getRoleList', param);
  }

  saveOrUpdateRole(param): any {
    let url = !param.id ? '/SystemRole/addRole' : '/SystemRole/modifyRole';
    return this.http.post(url, param);
  }

  getRoleById(id): any {
    return this.http.get('/SystemRole/getRoleById?id=' + id);
  }

  deleteRoleByIds(ids): any {
    return this.http.post('/SystemRole/deleteRoleByIds', ids);
  }

  getAllRoles(): any {
    return this.http.post('/SystemRole/getAllRoles', null);
  }
}
