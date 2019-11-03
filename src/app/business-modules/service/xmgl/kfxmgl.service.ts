import { Injectable } from '@angular/core';
import { HttpRestService } from '../http-rest.service';

@Injectable({
  providedIn: 'root'
})
export class KfxmglService {
  constructor(private http: HttpRestService) {}

  //添加或修改开发项目
  saveOrUpdateProject(param): any {
    return this.http.post('/Project/saveOrUpdateProject', param);
  }

  //获取信息详情
  getProjectById(id): any {
    return this.http.get('/Project/getProjectById?id=' + id);
  }

  //删除["id"]
  deleteProjectByIds(ids): any {
    return this.http.post('/Project/deleteProjectByIds', ids);
  }

  // 查询列表
  getProjectList(param): any {
    return this.http.post('/Project/getProjectList', param);
  }

  // 审核项目
  auditProjects(params): any {
    return this.http.post('/Project/auditProjects', params);
  }

  //提交审核
  auditProjectById(id , type): any {
    return this.http.get('/Project/auditProjectById?id=' + id + '&type=' + type);
  }

}
