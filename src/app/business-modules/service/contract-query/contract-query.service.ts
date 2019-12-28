import { Injectable } from '@angular/core';
import { HttpRestService } from '../http-rest.service';

@Injectable({
  providedIn: 'root'
})
export class ContractQueryService {

  constructor(private http: HttpRestService) { }


//商品房合同查询
QueryNewHouseTradeByCode(data): Promise<any> {
    return this.http.post('/DataExchange/QueryNewHouseTradeByCode',data);
  }


  //存量房合同查询
  QueryStockHouseTradeByCode(data): Promise<any> {
  return this.http.post('/DataExchange/QueryStockHouseTradeByCode',data);
}


  //楼盘预售证查询
  QueryPresaleByName(data): Promise<any> {
    return this.http.post('/DataExchange/QueryPresaleByName',data);
  }

  //房源查询(列表查询)
  QueryHouseResourceByName(data): Promise<any> {
    return this.http.post('/DataExchange/QueryHouseResourceByName',data);
  }


}
