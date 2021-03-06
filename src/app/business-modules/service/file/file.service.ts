import { Injectable } from '@angular/core';
import { HttpRestService } from '../http-rest.service';

@Injectable({
  providedIn: 'root'
})
export class FileService {

  constructor(private http: HttpRestService) { }

  //根据ref_id和type获取附件(带分页)
  getFileListByRefidAndType(data: any): Promise<any> {
    return this.http.post('/FileInfo/getFileListByRefidAndType', data);
  }

  getFileListById(id): Promise<any> {
    return this.http.get('/FileInfo/getFileListById?id=' + id);
  }

  delete(id): Promise<any> {
    return this.http.get('/FileInfo/delete?id=' + id);
  }

  deleteByIds(data:any): Promise<any> {
    return this.http.post('/FileInfo/deleteByIds',data);
  }

  getAttachDicCount(option): Promise<any> {
    return this.http.get('/FileInfo/getAttachDicCount?id=' + option.id + '&type=' + option.type);
  }
}
