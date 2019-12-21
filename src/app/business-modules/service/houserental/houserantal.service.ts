import { Injectable } from '@angular/core';
import { HttpRestService } from '../http-rest.service';

@Injectable({
    providedIn: 'root'
})
export class HouseRentalService {
    constructor(private http: HttpRestService) { }

    pageCache = {
        regioncode:'',
        address:'',
        usetype:'',
        isdecorated:'',
        selectId:'',
        pageIndex:1,
        pageSize:10
    }

    getHouseRentalList(data): any {
        return this.http.post('/HouseRental/getHouseRentalList', data);
    }

    SaveOrUpdateHouseRental(data): any {
        return this.http.post('/HouseRental/SaveOrUpdateHouseRental', data);
    }

    getHouseRentalById(id): any {
        return this.http.get('/HouseRental/getHouseRentalById?id=' + id);
    }

    deleteHouseRentalByIds(data): any {
        return this.http.post('/HouseRental/deleteHouseRentalByIds', data);
    }

    linkH(id, hid): any {
        return this.http.get('/HouseRental/linkH?id=' + id + "&hid=" + hid);
    }
}
