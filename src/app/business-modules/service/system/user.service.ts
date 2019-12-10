import { Injectable } from '@angular/core';
import { HttpRestService } from '../http-rest.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  constructor(private http: HttpRestService) { }

  getAllUser(): any {
    return this.http.post('/SystemUser/getAllUser', null);
  }
  getUserList(param): any {
    return this.http.post('/SystemUser/getUserList', param);
  }

  saveOrUpdateUser(param): any {
    let url = !param.id ? '/SystemUser/addUser' : '/SystemUser/modifyUser';
    return this.http.post(url, param);
  }

  //获取用户的角色详情
  getUserWithRoleByUserId(id): any {
    return this.http.get('/SystemUser/getUserWithRoleByUserId?id=' + id);
  }

  deleteUserByIds(ids): any {
    return this.http.post('/SystemUser/deleteUsersByIds', ids);
  }

  changePassword(currentUser: any): any {
    return this.http.post('/SystemUser/changePassword', currentUser);
  }

  // 系统登录
  login(param): any {
    return this.http.post('/SystemUser/login', param);
  }

  loginout(): any {
    return this.http.post('/SystemUser/loginout', null);
  }

  findUserByUsername(name): any {
    return this.http.get('/SystemUser/findUserByUsername?name=' + name);
  }

  findUserByCard(name): any {
    return this.http.get('/SystemUser/findUserByCard?card=' + name);
  }

  insertRoleManage(data, type): any {
    return this.http.post('/SystemUser/insertRoleManage?type=' + type, data);
  }

  insertUserCompany(data): any {
    return this.http.post('/SystemUser/insertUserCompany', data);
  }
}
