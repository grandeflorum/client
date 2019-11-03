import { Injectable } from '@angular/core';
import { HttpRestService } from '../http-rest.service';

@Injectable({
    providedIn: 'root'
})
export class StockHouseService {
    constructor(private http: HttpRestService) { }

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
}
