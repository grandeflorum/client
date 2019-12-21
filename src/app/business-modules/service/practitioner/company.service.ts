import { Injectable } from '@angular/core';
import { HttpRestService } from '../http-rest.service';

@Injectable({
    providedIn: 'root'
})
export class CompanyService {
    constructor(private http: HttpRestService) { }

    pageCache = {
        qymc:'',
        qylx:'',
        auditType:'',
        selectId:'',
        pageIndex:1,
        pageSize:10
    }

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
    btachAuditCompany(data): any {
        return this.http.post('/Company/btachAuditCompany', data);
    }


    /**
     * 添加关联关系
     */
    SaveOrUpdateAssociatedCompany(data): any {
        return this.http.post('/Company/SaveOrUpdateAssociatedCompany', data);
    }

    /**
     * 获取关联关系
     * @param id 
     * @param moduleName 
     */
    GetAssociatedCompany(id, moduleName): any {
        return this.http.get('/Company/GetAssociatedCompany?id=' + id + '&module=' + moduleName);
    }


    /**
     * 取消关联关系
     * @param data 
     */
    DeleteAssociatedCompany(data): any {
        return this.http.post('/Company/DeleteAssociatedCompany', data);
    }

}
