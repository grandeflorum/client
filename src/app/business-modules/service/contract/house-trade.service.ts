import { Injectable } from '@angular/core';
import { HttpRestService } from '../http-rest.service';

@Injectable({
  providedIn: 'root'
})
export class HouseTradeService {

  constructor(private http: HttpRestService) { }

  getHouseTradeList(data): any {
    return this.http.post('/HouseTrade/getHouseTradeList', data);
  }

  getHouseTradeCancelList(data): any {
    return this.http.post('/HouseTrade/getHouseTradeCancelList', data);
  }

  saveOrUpdateHouseTrade(data): any {
    return this.http.post('/HouseTrade/saveOrUpdateHouseTrade', data);
  }

  getHouseTradeById(id): any {
    return this.http.get('/HouseTrade/getHouseTradeById?id=' + id);
  }

  deleteHouseTradeByIds(data): any {
    return this.http.post('/HouseTrade/deleteHouseTradeByIds', data);
  }

  btachAuditHouseTrade(data): any {
    return this.http.post('/HouseTrade/btachAuditHouseTrade', data);
  }

  auditHouseTradeById(id, type): any {
    return this.http.get('/HouseTrade/auditHouseTradeById?id=' + id + "&type=" + type);
  }

  linkH(id, hid): any {
    return this.http.get('/HouseTrade/linkH?id=' + id + "&hid=" + hid);
  }

  previewHt(id): any {
    return this.http.get('/HouseTrade/previewHt?id=' + id);
  }

  getHInfo(hid): any {
    return this.http.get('/HouseTrade/getHInfo?hid=' + hid);
  }

  checkExistCompletionFile(id): any {
    return this.http.get('/HouseTrade/checkExistCompletionFile?id=' + id);
  }

  getEwmCheckInfo(data): any {
    return this.http.post('/HouseTrade/getEwmCheckInfo',data);
  }
}
