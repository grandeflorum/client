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
  myChart:any = {};
  option = {
    color: ['#3398DB'],
    tooltip : {
        trigger: 'axis',
        axisPointer : {            // 坐标轴指示器，坐标轴触发有效
            type : 'shadow'        // 默认为直线，可选为：'line' | 'shadow'
        }
    },
    grid: {
        left: '3%',
        right: '4%',
        bottom: '3%',
        containLabel: true
    },
    xAxis : [
        {
            type : 'category',
            data : [],
            axisTick: {
                alignWithLabel: true
            }
        }
    ],
    yAxis : [
        {
            type : 'value'
        }
    ],
    series : [
        {
            name:'销售量',
            type:'bar',
            barWidth: '60%',
            data:[]
        }
    ]
};

rankList = [
  {name:'保利城',ts:1000},
  {name:'华侨天府',ts:900},
  {name:'颐和尚景',ts:800},
  {name:'清江山水',ts:700},
  {name:'江南家园',ts:600},
  {name:'红馆',ts:500},
  {name:'华清苑',ts:400},
  {name:'鎏金园',ts:300},
  {name:'天祥上府',ts:200},
  {name:'华侨城',ts:100}
]

  constructor(
    private msg: NzMessageService,
    private router: Router,
    private kfxmglService: KfxmglService,
    private lpbglService: LpbglService,
    private statisticService:StatisticService
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

  echartChange(m){
    this.btnIndex = m;

    if(m == 1){//今日
      this.kssj = Moment(new Date()).format('YYYY-MM-DD');
      this.jssj = Moment(new Date()).format('YYYY-MM-DD');
      this.year = new Date().getFullYear();

    }else if(m == 2){//本周
      
    }else if(m == 3){//本月
      
    }else if(m == 4){//本季度
      
    }else if(m == 5){//本年
      
    }

    this.search();
  }

 async setXsEchart(){
   var option = {
     year:this.year,

   }
    var res = await this.statisticService.getOverallSalesTrend(option);
    if(res&&res.code == 200){
      this.option.xAxis[0].data = res.msg.X;
      this.option.series[0].data = res.msg.Y;
      this.myChart = echarts.init(document.getElementById("xs_echart"));
      this.myChart.off('click');
      this.myChart.setOption(this.option)
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


  onChange(m,type) {
    console.log(m)
  }

  selectItem(data) {
    this.selectId = data.id;
  }



 




  ngAfterViewInit() {
    var that = this;
    $(window).resize(function () {
 
    })
  }

}
