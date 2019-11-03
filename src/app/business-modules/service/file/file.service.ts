import { Injectable } from '@angular/core';
import { HttpRestService } from '../http-rest.service';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  constructor(private http: HttpRestService) { }

  //查询开发项目信息
  getFileListByRefidAndType(data: any): Promise<any> {
    return this.http.post('/FileInfo/getFileListByRefidAndType', data);
  }

getFileListById(id): Promise<any> {
    return this.http.get('/FileInfo/getFileListById?id=' + id);
  }

  delete(id): Promise<any> {
    return this.http.get('/FileInfo/delete?id=' + id);
  }
}
