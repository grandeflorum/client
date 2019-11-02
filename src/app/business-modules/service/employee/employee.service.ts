import { Injectable } from '@angular/core';
import { HttpRestService } from '../http-rest.service';

@Injectable({
  providedIn: 'root'
})
export class EmployeeService {

  constructor(private http: HttpRestService) { }

  /**
   * 根据id获取从业人员信息
   * @param id 
   */
  getEmployeeById(id): Promise<any> {
    return this.http.get('/Employee/getEmployeeById?id=' + id);
  }

  /**
   * 添加从业人员
   * @param data 
   */
  addEmployee(data: any): Promise<any> {
    return this.http.post('/Employee/addEmployee', data);
  }

  /**
   * 更新从业人员
   * @param data 
   */
  modifyEmployee(data: any): Promise<any> {
    return this.http.post('/Employee/modifyEmployee', data);
  }

  /**
   * 根据id集合删除从业人员
   * @param data 
   */
  deleteEmployeeByIds(data: any): Promise<any> {
    return this.http.post('/Employee/deleteEmployeeByIds', data);
  }

  /**
   * 获取列表对象
   * @param data 
   */
  getEmployeeList(data: any): Promise<any> {
    return this.http.post('/Employee/getEmployeeList', data);
  }

}
