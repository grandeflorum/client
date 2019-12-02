import { Injectable } from '@angular/core';
import { HttpRestService } from '../http-rest.service';

@Injectable({
    providedIn: 'root'
})
export class StatisticService {
    constructor(private http: HttpRestService) { }

    getHouseRentalStatistic(data): any {
        return this.http.post('/Statistic/getHouseRentalStatistic', data);
    }

}
