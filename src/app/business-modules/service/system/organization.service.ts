import { Injectable } from '@angular/core';
import { HttpRestService } from '../http-rest.service';

@Injectable({
  providedIn: 'root'
})
export class OrganizationService {
  constructor(private http: HttpRestService) {}

  getOrganizationList(param): any {
    return this.http.post('/SystemOrganization/getOrganizationList', param);
  }

  saveOrUpdateOrganization(param): any {
    let url = !param.id ? '/SystemOrganization/addOrganization' : '/SystemOrganization/modifyOrganization';
    return this.http.post(url, param);
  }

  getOrganizationById(id): any {
    return this.http.get('/SystemOrganization/getOrganizationById?id=' + id);
  }

  deleteOrganizationByIds(ids): any {
    return this.http.post('/SystemOrganization/deleteOrganizationByIds', ids);
  }
  getAllOrganization(): any {
    return this.http.post('/SystemOrganization/getAllOrganization', null);
  }
}
