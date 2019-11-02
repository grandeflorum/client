import { Injectable } from '@angular/core';
import { HttpRestService } from '../http-rest.service';

@Injectable({
  providedIn: 'root'
})
export class SystemDictionaryService {

  constructor(private http: HttpRestService) { }


  /**
   * 获取所有字典表数据
   */
  getAllDictionary(): Promise<any> {
    return this.http.post('/SystemDictionary/getAllDictionary', null);
  }
  
}
