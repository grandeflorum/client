import { Injectable } from '@angular/core';
import { HttpRestService } from '../http-rest.service';

@Injectable({
  providedIn: 'root'
})
export class LpbglService {
  constructor(private http: HttpRestService) { }

  //获取楼盘表列表
  getBuildingTableList(param): any {
    return this.http.post('/BuildingTable/getBuildingTableList', param);
  }

  //
  getZrz(id): any {
    return this.http.get('/BuildingTable/getZrz?id=' + id);
  }

  //
  getLjz(id): any {
    return this.http.get('/BuildingTable/getLjz?id=' + id);
  }

  getInfoByZh(zh, type): any {
    return this.http.get('/BuildingTable/getInfoByZh?ZH=' + zh + '&Type=' + type);
  }

}
