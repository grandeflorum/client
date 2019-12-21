import { Injectable } from '@angular/core';
import { HttpRestService } from '../http-rest.service';

@Injectable({
  providedIn: 'root'
})
export class LpbglService {
  constructor(private http: HttpRestService) { }

  pageCache = {
    xmmc:'',
    jzwmc:'',
    auditType:'',
    selectId:'',
    pageIndex:1,
    pageSize:10
}

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

  //添加或修改自然幢
  saveOrUpdateZRZ(data):any{
    return this.http.post('/BuildingTable/saveOrUpdateZRZ',data);
  }

 //添加或修改逻辑在
 saveOrUpdateLJZ(data):any{
  return this.http.post('/BuildingTable/saveOrUpdateLJZ',data);
 }

 //添加或修改层信息
 saveOrUpdateC(data):any{
  return this.http.post('/BuildingTable/saveOrUpdateC',data);
 }

//查看层详情
getCById(id):any{
  return this.http.get('/BuildingTable/getCById?id=' + id);
}

//删除层
deleteC(id):any{
  return this.http.get('/BuildingTable/deleteC?id=' + id);
}

//添加或修改户信息
saveOrUpdateH(data):any{
  return this.http.post('/BuildingTable/saveOrUpdateH',data);
}

//查看户详情
getHById(id):any{
  return this.http.get('/BuildingTable/getHById?id=' + id);
}

//删除户
deleteH(id):any{
  return this.http.get('/BuildingTable/deleteH?id=' + id);
}

//删除逻辑幢
deleteLJZ(id):any{
  return this.http.get('/BuildingTable/deleteLJZ?id=' + id);
}

//删除自然幢
deleteZRZ(id):any{
  return this.http.get('/BuildingTable/deleteZRZ?id=' + id);
}

// 审核项目
auditZRZs(params): any {
  return this.http.post('/BuildingTable/auditZRZs', params);
}

//提交审核
auditZRZById(id , type): any {
  return this.http.get('/BuildingTable/auditZRZById?id=' + id + '&type=' + type);
}

//添加或修改逻辑在
saveOrUpdateZRZandLJZ(data):any{
  return this.http.post('/BuildingTable/saveOrUpdateZRZandLJZ',data);
 }

 //合同备案历史
 getBAHistory(param): any {
  return this.http.post('/BuildingTable/getBAHistory', param);
}

}
