import { Injectable } from '@angular/core';
import { HttpRestService } from '../http-rest.service';

@Injectable({
  providedIn: 'root'
})
export class StockTradeService {

  constructor(private http: HttpRestService) { }
  pageCache = {
    xmmc:'',
    jzwmc:'',
    currentStatus:'',
    selectId:'',
    pageIndex:1,
    pageSize:10
}

  getStockTradeList(data): any {
    return this.http.post('/StockTrade/getStockTradeList', data);
  }

  getStockTradeCancelList(data): any {
    return this.http.post('/StockTrade/getStockTradeCancelList', data);
  }

  saveOrUpdateStockTrade(data): any {
    return this.http.post('/StockTrade/saveOrUpdateStockTrade', data);
  }

  getStockTradeById(id): any {
    return this.http.get('/StockTrade/getStockTradeById?id=' + id);
  }

  deleteStockTradeByIds(data): any {
    return this.http.post('/StockTrade/deleteStockTradeByIds', data);
  }

  btachAuditStockTrade(data): any {
    return this.http.post('/StockTrade/btachAuditStockTrade', data);
  }

  auditStockTradeById(id, type): any {
    return this.http.get('/StockTrade/auditStockTradeById?id=' + id + "&type=" + type);
  }

  linkH(id, hid): any {
    return this.http.get('/StockTrade/linkH?id=' + id + "&hid=" + hid);
  }

  sh(id):any{
    return this.http.get('/StockTrade/sh?id=' + id);
  }
  
  getHInfo(hid): any {
    return this.http.get('/StockTrade/getHInfo?hid=' + hid);
  }

  AuditHouseTradeNew(data):any{
    return this.http.post('/StockTrade/AuditHouseTradeNew',data);
  }
}
