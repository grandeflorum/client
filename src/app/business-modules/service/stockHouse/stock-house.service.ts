import { Injectable } from '@angular/core';
import { HttpRestService } from '../http-rest.service';

@Injectable({
    providedIn: 'root'
})
export class StockHouseService {
    constructor(private http: HttpRestService) { }

    pageCache = {
        cqrxm:'',
        cqzh:'',
        auditType:'',
        selectId:'',
        pageIndex:1,
        pageSize:10
    }

    getStockHouseList(data): any {
        return this.http.post('/StockHouse/getStockHouseList', data);
    }

    saveOrUpdateStockHouse(data): any {
        return this.http.post('/StockHouse/saveOrUpdateStockHouse', data);
    }

    getStockHouseById(id): any {
        return this.http.get('/StockHouse/getStockHouseById?id=' + id);
    }

    deleteStockHouseByIds(data): any {
        return this.http.post('/StockHouse/deleteStockHouseByIds', data);
    }

    auditStockHouseById(id, type): any {
        return this.http.get('/StockHouse/auditStockHouseById?id=' + id + "&type=" + type);
    }
    // 审核项目
    auditStockHouses(params): any {
        return this.http.post('/StockHouse/auditStockHouses', params);
    }

    linkH(ljzid, hid): any {
        return this.http.get('/StockHouse/linkH?ljzid=' + ljzid + "&hid=" + hid);
    }
}
