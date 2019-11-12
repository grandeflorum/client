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

  saveOrUpdateHouseTrade(data): any {
    return this.http.post('/HouseTrade/saveOrUpdateHouseTrade', data);
  }

  getHouseTradeById(id): any {
    return this.http.get('/HouseTrade/getHouseTradeById?id=' + id);
  }

  deleteHouseTradeByIds(data): any {
    return this.http.post('/HouseTrade/deleteHouseTradeByIds', data);
  }

  btachAuditHouseTrade(data):any {
    return this.http.post('/HouseTrade/btachAuditHouseTrade', data);
  }

  auditHouseTradeById(id, type): any {
    return this.http.get('/HouseTrade/auditHouseTradeById?id=' + id + "&type=" + type);
}


}
