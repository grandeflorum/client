import { Injectable } from '@angular/core';
import { HttpRestService } from '../http-rest.service';

@Injectable({
  providedIn: 'root'
})
export class ContractService {

  constructor(private http: HttpRestService) { }

  //下载合同模板
  downloadDocByEditor(data): Promise<any> {
    return this.http.post('/ContractTemplate/downloadDocByEditor',data);
  }

  //保存合同模板
  SaveContractTemplate(data): Promise<any> {
    return this.http.post('/ContractTemplate/SaveContractTemplate',data);
  }

  //获取合同模板
  getContractTemplateById(id): Promise<any> {
    return this.http.get('/ContractTemplate/getContractTemplateById?id=' + id);
  }

   //获取合同模板历史修改记录
   getContractTemplateHistoryList(data: any): Promise<any> {
    return this.http.post('/ContractTemplate/getContractTemplateHistoryList', data);
  }

  //获取合同模板
  getContractTemplateByType(type): Promise<any> {
    return this.http.get('/ContractTemplate/getContractTemplateByType?type=' + type);
  }

  //获取历史合同模板
  getContractTemplateHistoryById(id): Promise<any> {
    return this.http.get('/ContractTemplate/getContractTemplateHistoryById?id=' + id);
  }
  
}
