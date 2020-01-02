import { Component, OnInit, ViewChildren, QueryList, Input } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd';
import { Router } from '@angular/router';
import { KfxmglService } from '../../service/xmgl/kfxmgl.service';
import { LpbglService } from '../../service/lpbgl/lpbgl.service';
import { StatisticService } from '../../service/statistic/statistic.service';
import * as Moment from 'moment';
import * as $ from 'jquery';
import * as echarts from 'echarts';

@Component({
  selector: 'app-xsphbfx',
  templateUrl: './xsphbfx.component.html',
  styleUrls: ['./xsphbfx.component.scss']
})
export class XsphbfxComponent implements OnInit {
  @Input() type = "";
  @Input() glType = "";
  @Input() pid = "";

  pageIndex: any = 1;
  totalCount: any = 0;
  pageSize: any = 10;
  Loading = false;

  dataSet: any = [];
  sortList: any = [];
  selectId: any = '';
  mc = '';

  isVisible = false;
  dataType = 0;
  dateYear = null;
  dateMonth = null;
  dateDay = null;
  dataQuarter = 1;
  shxxObj: any = {
    ids: [],
    wfAudit: {
      shjg: "1",
      shry: '',
      bz: '',
      shrq: null
    }
  }
  isAllDisplayDataChecked = false;
  isIndeterminate = false;
  listOfDisplayData = [];
  listOfAllData = [];
  mapOfCheckedId: { [key: string]: boolean } = {};
  numberOfChecked = 0;
  kssj = null;
  jssj = null;
  year = new Date().getFullYear();
  tabs = [
    { name: '销售量', index: 0 },
    { name: '销售均价', index: 1 },
    { name: '销售面积', index: 2 }
  ]
  tabsetIndex = 0;
  dateRange = [];
  btnIndex = 1;
  myChart: any = {};
  option = {
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
        data: [],
        axisTick: {
          alignWithLabel: true
        }
      }
    ],
    yAxis: [
      {
        type: 'value'
      }
    ],
    series: [
      {
        name: '销售量',
        type: 'bar',
        barWidth: '60%',
        data: []
      }
    ]
  };

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
  ]

  nowDayOfWeek = new Date().getDay(); //今天本周的第几天
  nowDay = new Date().getDate(); //当前日
  nowMonth = new Date().getMonth(); //当前月
  nowYear = new Date().getFullYear(); //当前年

  constructor(
    private msg: NzMessageService,
    private router: Router,
    private kfxmglService: KfxmglService,
    private lpbglService: LpbglService,
    private statisticService: StatisticService
  ) { }

  ngOnInit() {
    setTimeout(() => {
      this.setXsEchart();
    }, 500);

    this.echartChange(1);
  }

  tabsetChange(m) {
    this.tabsetIndex = m;
  }

  echartChange(m) {
    this.btnIndex = m;

    this.nowDayOfWeek = new Date().getDay(); //今天本周的第几天
    this.nowDay = new Date().getDate(); //当前日
    this.nowMonth = new Date().getMonth(); //当前月
    this.nowYear = new Date().getFullYear(); //当前年

    if (m == 1) {//今日
      this.kssj = Moment(new Date()).format('YYYY-MM-DD');
      this.jssj = Moment(new Date()).format('YYYY-MM-DD');
      this.year = new Date().getFullYear();

    } else if (m == 2) {//本周
      this.kssj = this.ghGetWeekStartDate();
      this.jssj = this.ghGetNextWeekStartDate();
    } else if (m == 3) {//本月
      this.kssj = this.ghGetMonthStartDate();
      this.jssj = this.ghGetNextMonthStartDate();
    } else if (m == 4) {//本季度
      this.kssj = this.ghGetQuarterStartDate();
      this.jssj = this.ghGetNextQuarterStartDate();
    } else if (m == 5) {//本年
      this.kssj = Moment(new Date(new Date().getFullYear(), 0, 1)).format('YYYY-MM-DD');
      this.jssj = Moment(new Date()).format('YYYY-MM-DD');
    }
    this.searchTopTen();
    this.search();
  }

  async setXsEchart() {
    var option = {
      year: this.year,

    }
    var res = await this.statisticService.getOverallSalesTrend(option);
    if (res && res.code == 200) {
      this.option.xAxis[0].data = res.msg.X;
      this.option.series[0].data = res.msg.Y;
      this.myChart = echarts.init(document.getElementById("xs_echart"));
      this.myChart.off('click');
      this.myChart.setOption(this.option)
    }


  }

  async searchTopTen() {

    let option = {
      pageNo: 1,
      pageSize: 10,
      conditions: []
    };

    if (this.kssj) {
      option.conditions.push({ key: 'kssj', value: this.kssj });
    }

    if (this.jssj) {
      option.conditions.push({ key: 'jssj', value: this.jssj });
    }

    option.conditions.push({ key: 'sort', value: ['xsl desc'] });


    var res = await this.statisticService.getProjectSalesVolumeList(option);
    this.Loading = false;
    if (res.code == 200) {
      this.rankList = res.msg.currentList;

    }
  }

  async search() {
    this.Loading = true;
    let option = {
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

    if (this.jssj) {
      option.conditions.push({ key: 'jssj', value: this.jssj });
    }


    option.conditions.push({ key: 'sort', value: this.sortList });

    var res = await this.statisticService.getProjectSalesVolumeList(option);
    this.Loading = false;
    if (res.code == 200) {
      this.dataSet = res.msg.currentList;
      this.totalCount = res.msg.recordCount;

    }

    this.operateData();

  }

  //排序
  sort(evt) {
    let key = evt.key;

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

  export() {
    window.open(AppConfig.Configuration.baseUrl + "/Statistic/excelDownload?mc=" + this.mc + "&kssj=" + this.kssj + "&jssj=" + this.jssj + '&exportType=sales');
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
    console.log(m)
    if (type == 'year') {
      this.kssj = Moment(new Date(m.getFullYear(), 0, 1)).format('YYYY-MM-DD');
      this.jssj = Moment(new Date(m.getFullYear(), 12, 1)).format('YYYY-MM-DD');
      this.year = m.getFullYear();
    } else if (type == 'month') {
      var selectMonth = m.getMonth();
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
    this.searchTopTen();
    this.search();
  }

  selectItem(data) {
    this.selectId = data.id;
  }


  formatDate(date) {
    return Moment(date).format('YYYY-MM-DD');
  }

  //获得某月的天数
  getMonthDays(theYear, theMonth) {
    var monthStartDate: any = new Date(theYear, theMonth, 1);
    var monthEndDate: any = new Date(theYear, theMonth + 1, 1);
    var days = (monthEndDate - monthStartDate) / (1000 * 60 * 60 * 24);
    return days;
  }

  //获得本季度的开始月份
  getQuarterStartMonth(theMonth?) {
    if (!theMonth) {
      theMonth = this.nowMonth;
    }
    var quarterStartMonth = 0;
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

  //获得本周的开始日期
  ghGetWeekStartDate() {
    var weekStartDate = new Date(this.nowYear, this.nowMonth, this.nowDay - this.nowDayOfWeek + 1);
    return this.formatDate(weekStartDate);
  }
  //获得本周的结束日期
  ghGetWeekEndDate() {
    var weekEndDate = new Date(this.nowYear, this.nowMonth, this.nowDay + (6 - this.nowDayOfWeek) + 1);
    return this.formatDate(weekEndDate);
  }

  //获得下周的开始日期
  ghGetNextWeekStartDate() {
    var weekStartDate = new Date(this.nowYear, this.nowMonth, this.nowDay - this.nowDayOfWeek + 7 + 1);
    return this.formatDate(weekStartDate);
  }

  //获得本月的开始日期
  ghGetMonthStartDate() {
    var monthStartDate = new Date(this.nowYear, this.nowMonth, 1);
    return this.formatDate(monthStartDate);
  }

  //获得本月的结束日期
  ghGetMonthEndDate() {
    var monthEndDate = new Date(this.nowYear, this.nowMonth, this.getMonthDays(this.nowYear, this.nowMonth));
    return this.formatDate(monthEndDate);
  }

  //获得下月开始时间
  ghGetNextMonthStartDate() {
    var theYear = this.nowYear;
    var theMonth = this.nowMonth + 1;
    if (theMonth == 12) {
      theYear += 1;
      theMonth = 0;
    }
    var nextMonthStartDate = new Date(theYear, theMonth, 1);
    return this.formatDate(nextMonthStartDate);
  }

  //获得本季度的开始日期
  ghGetQuarterStartDate() {
    var quarterStartDate = new Date(this.nowYear, this.getQuarterStartMonth(), 1);
    return this.formatDate(quarterStartDate);
  }

  //或的本季度的结束日期
  ghGetQuarterEndDate() {
    var quarterEndMonth = this.getQuarterStartMonth() + 2;
    var quarterStartDate = new Date(this.nowYear, quarterEndMonth,
      this.getMonthDays(this.nowYear, quarterEndMonth));
    return this.formatDate(quarterStartDate);
  }

  ghGetNextQuarterStartDate() {
    var theYear = this.nowYear;
    var theQuarterMonth = this.nowMonth + 3;
    if (theQuarterMonth > 11) {
      theYear += 1;
      theQuarterMonth -= 12;
    }
    var quarterStartDate = new Date(theYear, this.getQuarterStartMonth(theQuarterMonth), 1);
    return this.formatDate(quarterStartDate);
  }





  ngAfterViewInit() {
    var that = this;
    $(window).resize(function () {

    })
  }

}
