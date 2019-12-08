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

    //获取总销售量趋势
    getOverallSalesTrend(data): any {
        return this.http.post('/Statistic/getOverallSalesTrend', data);
    }

    //获取项目销售量列表
    getProjectSalesVolumeList(data): any {
        return this.http.post('/Statistic/getProjectSalesVolumeList', data);
    }

    //获取时间查询统计分析统计值
    getTimeQueryStatistics(data): any {
        return this.http.post('/Statistic/getTimeQueryStatistics', data);
    }
    //获取销售用途汇总
    getSummarySalesPurposes(data): any {
        return this.http.post('/Statistic/getSummarySalesPurposes', data);
    }

        //获取交易汇总统计
        getTransactionSummaryStatistic(data): any {
            return this.http.post('/Statistic/getTransactionSummaryStatistic', data);
        }
}

