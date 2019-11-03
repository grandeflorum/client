import { Injectable } from '@angular/core';
import { HttpRestService } from '../http-rest.service';

@Injectable({
    providedIn: 'root'
})
export class CompanyService {
    constructor(private http: HttpRestService) { }

    getCompanyList(data): any {
        return this.http.post('/Company/getCompanyList', data);
    }

    saveOrUpdateCompany(data): any {
        return this.http.post('/Company/saveOrUpdateCompany', data);
    }

    getCompanyById(id): any {
        return this.http.get('/Company/getCompanyById?id=' + id);
    }

    deleteCompanyByIds(data): any {
        return this.http.post('/Company/deleteCompanyByIds', data);
    }

    auditCompanyById(id, type): any {
        return this.http.get('/Company/auditCompanyById?id=' + id + "&type=" + type);
    }

    //批量审核
    btachAuditCompany(data):any{
        return this.http.post('/Company/btachAuditCompany', data);
    }
}
