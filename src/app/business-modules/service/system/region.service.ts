import { Injectable } from '@angular/core';
import { HttpRestService } from '../http-rest.service';

@Injectable({
    providedIn: 'root'
})
export class RegionService {
    constructor(private http: HttpRestService) { }

    getAllRegion(): any {
        return this.http.post('/SysRegion/getAllRegion', null);
    }
}
