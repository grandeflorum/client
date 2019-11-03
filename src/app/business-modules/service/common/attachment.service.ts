import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { HttpRestService } from '../http-rest.service';

@Injectable({
    providedIn: 'root'
})
export class AttachmentSercice {




    constructor(private http: HttpRestService) { }


    deleteFileById(param): any {
        return this.http.get('/FileInfo/delete?id='+param);
    }

    getFileListById(param):any{
        return this.http.get('/FileInfo/getFileListById?id='+param);
    }


}
