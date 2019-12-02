import { Component, OnInit, ViewChildren, QueryList, Input } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd';
import { Router } from '@angular/router';
import { KfxmglService } from '../../service/xmgl/kfxmgl.service';
import { LpbglService } from '../../service/lpbgl/lpbgl.service';
import * as Moment from 'moment';
import * as $ from 'jquery';
import * as echarts from 'echarts';
import { StatisticService } from '../../service/statistic/statistic.service';

@Component({
  selector: 'app-xsphbfx',
  templateUrl: './xsphbfx.component.html',
  styleUrls: ['./xsphbfx.component.scss']
})
export class XsphbfxComponent implements OnInit {

  //时间查询字段
  date1: any = new Date();
  date2: any = new Date(new Date().getFullYear() - 2,1,1);
  date3: any = new Date();

  tabs = [
    { name: '商品房', index: 0 },
    { name: '存量房', index: 1 },
    { name: '房屋租赁', index: 2 }
  ];
  tabsetIndex = 2;

  items = [
    { name: "平均租金", value: "zj" },
    { name: "成交套数", value: "ts" }
  ];
  dlValue: any = "zj";

  btnIndex = 1;
  myChart: any = {};
  myChart1: any = {};

  dateResult: any = [];
  regionResult: any = []


  constructor(
    private msg: NzMessageService,
    private router: Router,
    private kfxmglService: KfxmglService,
    private lpbglService: LpbglService,
    private statisticService: StatisticService
  ) { }

  ngOnInit() {
    this.search();
  }

  tabsetChange(m) {
    this.tabsetIndex = m;
  }

  echartChange(m) {
    this.btnIndex = m;
  }

  async search() {

    var startDate, endDate;
    if (this.btnIndex == 1 || this.btnIndex == 2) {
      if (!this.date1) {
        this.msg.create("warning", "请选择时间");
        return;
      }
      startDate = this.date1;
    } else {
      if (!this.date2) {
        this.msg.create("warning", "请选择开始时间");
        return;
      }
      if (!this.date3) {
        this.msg.create("warning", "请选择结束时间");
        return;
      }
      startDate = this.date2;
      endDate = this.date3;

    }

    var data = {
      startDate: startDate.getFullYear(),
      endDate: endDate?endDate.getFullYear():"",
      type: this.btnIndex
    };
    let res = await this.statisticService.getHouseRentalStatistic(data);
    if (res && res.code == 200) {
      this.dateResult = res.msg.dateResult;
      this.regionResult = res.msg.regionResult;
      this.initChart();
    }
  }

  initChart() {

    var data = [];
    var regionData = [];

    var title = "";
    var statisticName = "";
    var unit = "";

    if (this.dlValue == "zj") {
      title = "平均租金统计";
      statisticName = "平均租金";
      unit = "元";
      this.dateResult.forEach(element => {
        data.push(element.zj);
      });
      this.regionResult.forEach(element => {
        regionData.push(element.zj);
      });
    } else {
      title = "套数统计";
      statisticName = "套数";
      unit = "套";
      this.dateResult.forEach(element => {
        data.push(element.ts);
      });

      this.regionResult.forEach(element => {
        regionData.push(element.ts);
      });
    }

    let option = {
      title: {
        text: title,
        x: 'center'
      },
      color: ['#3398DB'],
      tooltip: {
        trigger: 'axis',
        axisPointer: {            // 坐标轴指示器，坐标轴触发有效
          type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: [
        {
          type: 'category',
          data: this.dateResult.map(function (v) {
            return v.dateValue;
          }),
          axisTick: {
            alignWithLabel: true
          }
        }
      ],
      yAxis: [
        {
          name: unit,
          type: 'value'
        }
      ],
      series: [
        {
          name: statisticName,
          type: 'bar',
          barWidth: '60%',
          data: data
        }
      ]
    };

    this.myChart = echarts.init(document.getElementById("echart1"));
    this.myChart.off('click');
    this.myChart.setOption(option);


    let option1 = {
      title: {
        text: "行政区"+title,
        x: 'center'
      },
      color: ['#3398DB'],
      tooltip: {
        trigger: 'axis',
        axisPointer: {            // 坐标轴指示器，坐标轴触发有效
          type: 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
        }
      },
      grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
      },
      xAxis: [
        {
          type: 'category',
          data: this.regionResult.map(function (v) {
            return v.regionName;
          }),
          axisTick: {
            alignWithLabel: true
          }
        }
      ],
      yAxis: [
        {
          name: unit,
          type: 'value'
        }
      ],
      series: [
        {
          name: statisticName,
          type: 'bar',
          barWidth: '60%',
          data: regionData
        }
      ]
    };

    this.myChart1 = echarts.init(document.getElementById("echart2"));
    this.myChart1.off('click');
    this.myChart1.setOption(option1)


  }

  dlValueChange(value){
    this.initChart();
  }











}
