import { Component, OnInit, ViewChildren, QueryList, Input } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd';
import { Router } from '@angular/router';
import { KfxmglService } from '../../service/xmgl/kfxmgl.service';
import { LpbglService } from '../../service/lpbgl/lpbgl.service';
import { Localstorage } from '../../service/localstorage';
import { StatisticService } from '../../service/statistic/statistic.service';
import * as Moment from 'moment';
import * as $ from 'jquery';
import * as echarts from 'echarts';

@Component({
  selector: 'app-sjcxtjfx',
  templateUrl: './sjcxtjfx.component.html',
  styleUrls: ['./sjcxtjfx.component.scss']
})
export class SjcxtjfxComponent implements OnInit {
  @Input() type = '';
  @Input() glType = '';
  @Input() pid = '';

  pageIndex: any = 1;
  totalCount: any = 0;
  pageSize: any = 10;
  Loading = false;

  dataSet: any = [];
  sortList: any = [];
  selectId: any = '';

  isVisible = false;
  dataType = 0;
  dateYear = null;
  dateMonth = null;
  dateDay = null;
  dataQuarter = 1;
  shxxObj: any = {
    ids: [],
    wfAudit: {
      shjg: '1',
      shry: '',
      bz: '',
      shrq: null
    }
  };
  isAllDisplayDataChecked = false;
  isIndeterminate = false;
  listOfDisplayData = [];
  listOfAllData = [];
  mapOfCheckedId: { [key: string]: boolean } = {};
  numberOfChecked = 0;
  dictionaryObj: any = {};
  tabsetIndex = 0;
  dateRange = [];
  btnIndex = 1;
  mc = '';
  yt = '';
  lx = '';
  rankList = [
    { name: '保利城', ts: 1000 },
    { name: '华侨天府', ts: 900 },
    { name: '颐和尚景', ts: 800 },
    { name: '清江山水', ts: 700 },
    { name: '江南家园', ts: 600 },
    { name: '红馆', ts: 500 },
    { name: '华清苑', ts: 400 },
    { name: '鎏金园', ts: 300 },
    { name: '天祥上府', ts: 200 },
    { name: '华侨城', ts: 100 }
  ];
  kssj = null;
  jssj = null;
  year = new Date().getFullYear();
  nowDayOfWeek = new Date().getDay(); // 今天本周的第几天
  nowDay = new Date().getDate(); // 当前日
  nowMonth = new Date().getMonth(); // 当前月
  nowYear = new Date().getFullYear(); // 当前年
  staticValue: any = {};
  szj = '';
  smj = '';
  sts = '';
  czj = '';
  cmj = '';
  cts = '';

  constructor(
    private msg: NzMessageService,
    private router: Router,
    private kfxmglService: KfxmglService,
    private lpbglService: LpbglService,
    private localstorage: Localstorage,
    private statisticService: StatisticService
  ) {
    this.dictionaryObj = this.localstorage.getObject('dictionary');
  }

  ngOnInit() {
    this.echartChange(1);
  }

  tabsetChange(m) {
    this.tabsetIndex = m;
  }

  echartChange(m) {
    this.btnIndex = m;

    this.nowDayOfWeek = new Date().getDay(); // 今天本周的第几天
    this.nowDay = new Date().getDate(); // 当前日
    this.nowMonth = new Date().getMonth(); // 当前月
    this.nowYear = new Date().getFullYear(); // 当前年

    if (m == 1) {// 今日
      this.kssj = Moment(new Date()).format('YYYY-MM-DD');
      this.jssj = Moment(new Date()).format('YYYY-MM-DD');
      this.year = new Date().getFullYear();

    } else if (m == 2) {// 本周
      this.kssj = this.ghGetWeekStartDate();
      this.jssj = this.ghGetNextWeekStartDate();
    } else if (m == 3) {// 本月
      this.kssj = this.ghGetMonthStartDate();
      this.jssj = this.ghGetNextMonthStartDate();
    } else if (m == 4) {// 本季度
      this.kssj = this.ghGetQuarterStartDate();
      this.jssj = this.ghGetNextQuarterStartDate();
    } else if (m == 5) {// 本年
      this.kssj = Moment(new Date(new Date().getFullYear(), 0, 1)).format('YYYY-MM-DD');
      this.jssj = Moment(new Date(new Date().getFullYear() + 1, 0, 1)).format('YYYY-MM-DD');
    }
    this.searchStatistics();
    this.search();
  }

  export() {
    window.open(AppConfig.Configuration.baseUrl + '/Statistic/excelDownload?mc=' + this.mc + '&yt=' + this.yt + '&lx=' + this.lx + '&kssj=' + this.kssj + '&jssj=' + this.jssj + '&exportType=date');
  }

  async searchStatistics() {
    this.Loading = true;
    const option = {
      pageNo: this.pageIndex,
      pageSize: this.pageSize,
      conditions: []
    };


    let data;

    data = {};

    if (this.kssj) {
      option.conditions.push({ key: 'kssj', value: this.kssj });

      data.kssj = this.kssj;
    }

    if (this.jssj) {
      option.conditions.push({ key: 'jssj', value: this.jssj });

      data.jssj = this.jssj;
    }



    const res = await this.statisticService.getTimeQueryStatistics(data);
    this.Loading = false;
    if (res.code == 200) {
    console.log(res.msg.mj);
    console.log(res.msg.ts);
    this.staticValue.zj = res.msg.zj;
    this.staticValue.mj = res.msg.mj;
    this.staticValue.ts = res.msg.ts;
    this.szj = res.msg.szj;
    this.smj = res.msg.smj;
    this.sts = res.msg.sts;
    this.czj = res.msg.czj;
    this.cmj = res.msg.cmj;
    this.cts = res.msg.cts;


    }


  }

  async search() {
    this.Loading = true;
    const option = {
      pageNo: this.pageIndex,
      pageSize: this.pageSize,
      conditions: []
    };

    if (this.mc) {
      option.conditions.push({ key: 'mc', value: this.mc });
    }

    if (this.kssj) {
      option.conditions.push({ key: 'kssj', value: this.kssj });
    }

    if (this.yt) {
      option.conditions.push({ key: 'yt', value: this.yt });
    }

    if (this.jssj) {
      option.conditions.push({ key: 'jssj', value: this.jssj });
    }

    option.conditions.push({ key: 'lx', value: this.lx });
    option.conditions.push({ key: 'sort', value: this.sortList });
    console.log(this.lx);
    const res = await this.statisticService.getSalesVolumeTotalList(option);
    this.Loading = false;
    if (res.code == 200) {
      this.dataSet = res.msg.currentList;
      this.totalCount = res.msg.recordCount;

    }

    this.operateData();

  }

  // 排序
  sort(evt) {
    const key = evt.key;

    if (this.sortList.some(x => x.indexOf(key) > -1)) {
      this.sortList.splice(this.sortList.findIndex(x => x.indexOf(key) > -1), 1);
    }

    if (evt.value) {
      if (evt.value == 'ascend') {
        this.sortList.push(key);
      } else if (evt.value == 'descend') {
        this.sortList.push(key + ' desc');
      }
    }

    this.search();
  }


  pageIndexChange(num) {
    this.pageIndex = num;
    this.search();
  }

  pageSizeChange(num) {
    this.pageSize = num;
    this.pageIndex = 1;
    this.search();
  }



  currentPageDataChange($event): void {
    this.listOfDisplayData = $event;
    this.refreshStatus();
  }

  refreshStatus(): void {
    this.isAllDisplayDataChecked = this.listOfDisplayData
      .filter(item => !item.disabled)
      .every(item => this.mapOfCheckedId[item.id]);
    this.isIndeterminate =
      this.listOfDisplayData.filter(item => !item.disabled).some(item => this.mapOfCheckedId[item.id]) &&
      !this.isAllDisplayDataChecked;
    this.numberOfChecked = this.listOfAllData.filter(item => this.mapOfCheckedId[item.id]).length;
  }

  checkAll(value: boolean): void {
    this.listOfDisplayData.filter(item => !item.disabled).forEach(item => (this.mapOfCheckedId[item.id] = value));
    this.refreshStatus();
  }

  operateData(): void {
    setTimeout(() => {
      this.listOfAllData.forEach(item => (this.mapOfCheckedId[item.id] = false));
      this.refreshStatus();
    }, 1000);
  }


  onChange(m, type) {
    console.log(m);
    if (type == 'year') {
      this.kssj = Moment(new Date(m.getFullYear(), 0, 1)).format('YYYY-MM-DD');
      this.jssj = Moment(new Date(m.getFullYear(), 12, 1)).format('YYYY-MM-DD');
      this.year = m.getFullYear();
    } else if (type == 'month') {
      const selectMonth = m.getMonth();
      this.kssj = Moment(new Date(m.getFullYear(), selectMonth, 1)).format('YYYY-MM-DD');
      this.jssj = Moment(new Date(m.getFullYear(), selectMonth + 1, 1)).format('YYYY-MM-DD');
      this.year = m.getFullYear();
    } else if (type == 'day') {
      this.kssj = Moment(m).format('YYYY-MM-DD');
      this.jssj = Moment(m).format('YYYY-MM-DD');
      this.year = m.getFullYear();
    } else if (type == 'quarter') {
      this.kssj = Moment(new Date(this.dateYear.getFullYear(), this.dataQuarter * 3 - 3, 1)).format('YYYY-MM-DD');
      this.jssj = Moment(new Date(this.dateYear.getFullYear(), this.dataQuarter * 3, 1)).format('YYYY-MM-DD');
    } else if (type == 'range') {
      this.kssj = Moment(this.dateRange[0]).format('YYYY-MM-DD');
      this.jssj = Moment(this.dateRange[1]).format('YYYY-MM-DD');
      this.year = m.getFullYear();
    }
    this.searchStatistics();
    this.search();
  }

  selectItem(data) {
    this.selectId = data.id;
  }


  formatDate(date) {
    return Moment(date).format('YYYY-MM-DD');
  }

  // 获得某月的天数
  getMonthDays(theYear, theMonth) {
    const monthStartDate: any = new Date(theYear, theMonth, 1);
    const monthEndDate: any = new Date(theYear, theMonth + 1, 1);
    const days = (monthEndDate - monthStartDate) / (1000 * 60 * 60 * 24);
    return days;
  }

  // 获得本季度的开始月份
  getQuarterStartMonth(theMonth?) {
    if (!theMonth) {
      theMonth = this.nowMonth;
    }
    let quarterStartMonth = 0;
    if (theMonth < 3) {
      quarterStartMonth = 0;
    }
    if (2 < theMonth && theMonth < 6) {
      quarterStartMonth = 3;
    }
    if (5 < theMonth && theMonth < 9) {
      quarterStartMonth = 6;
    }
    if (theMonth > 8) {
      quarterStartMonth = 9;
    }
    return quarterStartMonth;
  }

  // 获得本周的开始日期
  ghGetWeekStartDate() {
    const weekStartDate = new Date(this.nowYear, this.nowMonth, this.nowDay - this.nowDayOfWeek + 1);
    return this.formatDate(weekStartDate);
  }
  // 获得本周的结束日期
  ghGetWeekEndDate() {
    const weekEndDate = new Date(this.nowYear, this.nowMonth, this.nowDay + (6 - this.nowDayOfWeek) + 1);
    return this.formatDate(weekEndDate);
  }

  // 获得下周的开始日期
  ghGetNextWeekStartDate() {
    const weekStartDate = new Date(this.nowYear, this.nowMonth, this.nowDay - this.nowDayOfWeek + 7 + 1);
    return this.formatDate(weekStartDate);
  }

  // 获得本月的开始日期
  ghGetMonthStartDate() {
    const monthStartDate = new Date(this.nowYear, this.nowMonth, 1);
    return this.formatDate(monthStartDate);
  }

  // 获得本月的结束日期
  ghGetMonthEndDate() {
    const monthEndDate = new Date(this.nowYear, this.nowMonth, this.getMonthDays(this.nowYear, this.nowMonth));
    return this.formatDate(monthEndDate);
  }

  // 获得下月开始时间
  ghGetNextMonthStartDate() {
    let theYear = this.nowYear;
    let theMonth = this.nowMonth + 1;
    if (theMonth == 12) {
      theYear += 1;
      theMonth = 0;
    }
    const nextMonthStartDate = new Date(theYear, theMonth, 1);
    return this.formatDate(nextMonthStartDate);
  }

  // 获得本季度的开始日期
  ghGetQuarterStartDate() {
    const quarterStartDate = new Date(this.nowYear, this.getQuarterStartMonth(), 1);
    return this.formatDate(quarterStartDate);
  }

  // 或的本季度的结束日期
  ghGetQuarterEndDate() {
    const quarterEndMonth = this.getQuarterStartMonth() + 2;
    const quarterStartDate = new Date(this.nowYear, quarterEndMonth,
      this.getMonthDays(this.nowYear, quarterEndMonth));
    return this.formatDate(quarterStartDate);
  }

  ghGetNextQuarterStartDate() {
    let theYear = this.nowYear;
    let theQuarterMonth = this.nowMonth + 3;
    if (theQuarterMonth > 11) {
      theYear += 1;
      theQuarterMonth -= 12;
    }
    const quarterStartDate = new Date(theYear, this.getQuarterStartMonth(theQuarterMonth), 1);
    return this.formatDate(quarterStartDate);
  }






  ngAfterViewInit() {
    const that = this;
    $(window).resize(function() {

    });
  }

}
