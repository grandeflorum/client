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
  selector: 'app-jyhzxxfx',
  templateUrl: './jyhzxxfx.component.html',
  styleUrls: ['./jyhzxxfx.component.scss']
})
export class JyhzxxfxComponent implements OnInit {
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
  dictionaryObj: any = {};
  tabsetIndex = 0;
  dateRange = [];
  btnIndex = 1;
  mc = "";
  yt = "";
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
kssj = null;
jssj = null;
year = new Date().getFullYear();
nowDayOfWeek = new Date().getDay(); //今天本周的第几天
nowDay = new Date().getDate(); //当前日
nowMonth = new Date().getMonth(); //当前月
nowYear = new Date().getFullYear(); //当前年
staticValue:any = {};
differenceArea = 0;
differenceCount = 1;
echartTitleList = [];

tabs = [
  { name: '交易汇总', index: 0 ,type:'all'},
  { name: '新建商品房', index: 1 ,type:'new'},
  { name: '存量房', index: 2 ,type:'stock'}
]
staticList = [
  {name:'已销售套数',num:'100',unit:'套',hb:1,tb:2,hbFlag:null,tbFlag:null},
  {name:'已销售面积',num:'200',unit:'平方米',hb:-1,tb:5,hbFlag:null,tbFlag:null},
  {name:'未销售套数',num:'300',unit:'套',hb:0,tb:10,hbFlag:null,tbFlag:null},
  {name:'未销售面积',num:'400',unit:'平方米',hb:-5,tb:10,hbFlag:null,tbFlag:null}
];
querytype = "";
myChartList:any = [];
titleColorList = ['#1890ff','#ffae17','#58cb4b','#1890ff','#ffae17','#58cb4b','#1890ff','#ffae17','#58cb4b','#1890ff','#ffae17','#58cb4b'];

  constructor(
    private msg: NzMessageService,
    private router: Router,
    private kfxmglService: KfxmglService,
    private lpbglService: LpbglService,
    private localstorage: Localstorage,
    private statisticService:StatisticService
  ) { 
    this.dictionaryObj = this.localstorage.getObject("dictionary");
    
  }

  ngOnInit() {
    this.echartChange(1);
  }

  tabsetChange(m) {
    this.tabsetIndex = m;
    this.searchStatistics();
    this.search();
  }

  echartChange(m){
    this.btnIndex = m;

    this.nowDayOfWeek = new Date().getDay(); //今天本周的第几天
    this.nowDay = new Date().getDate(); //当前日
    this.nowMonth = new Date().getMonth(); //当前月
    this.nowYear = new Date().getFullYear(); //当前年

    if(m == 1){//今日
      this.kssj = Moment(new Date()).format('YYYY-MM-DD');
      this.jssj = Moment(new Date()).format('YYYY-MM-DD');
      this.year = new Date().getFullYear();
      this.querytype = 'Day';
    }else if(m == 2){//本周
      this.kssj = this.ghGetWeekStartDate();
      this.jssj = this.ghGetNextWeekStartDate();
      this.querytype = 'Week';
    }else if(m == 3){//本月
      this.kssj = this.ghGetMonthStartDate();
      this.jssj = this.ghGetNextMonthStartDate();
      this.querytype = 'Month';
    }else if(m == 4){//本季度
      this.kssj = this.ghGetQuarterStartDate();
      this.jssj = this.ghGetNextQuarterStartDate();
      this.querytype = 'Quarter';
    }else if(m == 5){//本年
      this.kssj = Moment(new Date(new Date().getFullYear(),0,1) ).format('YYYY-MM-DD');
      this.jssj =  Moment(new Date()).format('YYYY-MM-DD');
      this.querytype = 'Year';
    }
    this.searchStatistics();
    this.search();
  }

  export(){
    window.open( AppConfig.Configuration.baseUrl + "/Statistic/excelDownload?mc=" + this.mc + "&yt="+this.yt+"&kssj=" + this.kssj + "&jssj=" + this.jssj);
  }

  async searchStatistics() {
    let option = {
      kssj:this.kssj,
      jssj:this.jssj,
      type:this.tabs[this.tabsetIndex].type,
      querytype:this.querytype
    };


    var res = await this.statisticService.getTransactionSummaryStatistic(option);
    if (res.code == 200) {
      this.differenceArea = res.msg.differenceArea;
      this.differenceCount = res.msg.differenceCount;
      this.staticList = [
        {name:'已销售套数',num:res.msg.list[0].ts,unit:'套',hb:res.msg.list[0].hb,tb:res.msg.list[0].tb,hbFlag:res.msg.list[0].hbFlag,tbFlag:res.msg.list[0].tbFlag},
        {name:'已销售面积',num:res.msg.list[1].mj,unit:'平方米',hb:res.msg.list[1].hb,tb:res.msg.list[1].tb,hbFlag:res.msg.list[1].hbFlag,tbFlag:res.msg.list[1].tbFlag},
        {name:'未销售套数',num:res.msg.list[2].ts,unit:'套',hb:res.msg.list[2].hb,tb:res.msg.list[2].tb,hbFlag:res.msg.list[2].hbFlag,tbFlag:res.msg.list[2].tbFlag},
        {name:'未销售面积',num:res.msg.list[3].mj,unit:'平方米',hb:res.msg.list[3].hb,tb:res.msg.list[3].tb,hbFlag:res.msg.list[3].hbFlag,tbFlag:res.msg.list[3].tbFlag}
      ];
      

    }


  }

  async search() {
    this.Loading = true;
    let option = {
      kssj:this.kssj,
      jssj:this.jssj,
      type:this.tabs[this.tabsetIndex].type,
      querytype:this.querytype
    };


var res = await this.statisticService.getSummarySalesPurposes(option);
    this.Loading = false;
    if (res.code == 200) {
      this.dataSet = res.msg;

      setTimeout(() => {
        this.setMychart();
      }, 1000);
     

    }

    this.operateData();

  }


  setMychart(){
    var totalTs = 0;
    var totalMj = 0;
    this.myChartList = [];
    this.dataSet.forEach((v,k)=>{
      totalTs+=v.ts;
      totalMj+=v.mj;
      this.myChartList.push(k);
    })

    var colors=['#3ba1ff','#69d389','#f0f2f5'];

    this.dataSet.forEach((v,k)=>{
      var titleArr= [], seriesArr=[];
      titleArr.push(
        {
            text:'套数',
            left: '24%',
            top: '15%',
            textAlign: 'center',
            textStyle: {
                fontWeight: 'normal',
                fontSize: '16',
                // color: colors[index][0],
                textAlign: 'center',
            },
        } ,
        {
          text:'面积',
          left:'24%',
          top: '60%',
          textAlign: 'center',
          textStyle: {
              fontWeight: 'normal',
              fontSize: '16',
              // color: colors[index][0],
              textAlign: 'center',
          },
      }        
    );
    seriesArr.push(
        {
            name: v.name,
            type: 'pie',
            clockWise: false,
            radius: [55, 70],
            itemStyle:  {
                normal: {
                    color: colors[0],
                    shadowColor: colors[0],
                    shadowBlur: 0,
                    label: {
                        show: false
                    },
                    labelLine: {
                        show: false
                    },
                }
            },
            hoverAnimation: false,
            center: ['25%', '25%'],
            data: [{
                value: v.ts,
                label: {
                    normal: {
                        formatter: function(params){
                            return params.percent+'%';
                        },
                        position: 'center',
                        show: true,
                        textStyle: {
                            fontSize: '20',
                            fontWeight: 'bold',
                            color: '#000'
                        }
                    }
                },
            }, {
                value: totalTs - v.ts,
                name: 'invisible',
                itemStyle: {
                    normal: {
                        color: colors[2]
                    },
                    emphasis: {
                        color: colors[2]
                    }
                }
            }]
        },
        {
          name: v.name,
          type: 'pie',
          clockWise: false,
          radius: [55, 70],
          itemStyle:  {
              normal: {
                  color: colors[1],
                  shadowColor: colors[1],
                  shadowBlur: 0,
                  label: {
                      show: false
                  },
                  labelLine: {
                      show: false
                  },
              }
          },
          hoverAnimation: false,
          center: ['25%', '70%'],
          data: [{
              value: v.mj,
              label: {
                  normal: {
                      formatter: function(params){
                          return params.percent+'%';
                      },
                      position: 'center',
                      show: true,
                      textStyle: {
                          fontSize: '20',
                          fontWeight: 'bold',
                          color: '#000'
                      }
                  }
              },
          }, {
              value: totalMj - v.mj,
              name: 'invisible',
              itemStyle: {
                  normal: {
                      color: colors[2]
                  },
                  emphasis: {
                      color: colors[2]
                  }
              }
          }]
      }    
    )

    var option = {
      title:titleArr,
      series: seriesArr
    }
      this.myChartList[k] = echarts.init(document.getElementById(v.name));
      this.myChartList[k].off('click');
      this.myChartList[k].setOption(option)

   

    })

    


  

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
    this.querytype = "";
    if(type == 'year'){
      this.kssj = Moment(new Date(m.getFullYear(),0,1) ).format('YYYY-MM-DD');
      this.jssj =  Moment(new Date(m.getFullYear(),12,1)).format('YYYY-MM-DD');
      this.year = m.getFullYear();
    }else if(type == 'month'){
      var selectMonth = m.getMonth();
      this.kssj = Moment(new Date(m.getFullYear(),selectMonth,1) ).format('YYYY-MM-DD');
      this.jssj =  Moment(new Date(m.getFullYear(),selectMonth + 1,1)).format('YYYY-MM-DD');
      this.year = m.getFullYear();
    }else if(type == 'day'){
      this.kssj = Moment(m).format('YYYY-MM-DD');
      this.jssj =  Moment(m).format('YYYY-MM-DD');
      this.year = m.getFullYear();
    }else if(type == 'quarter'){
      this.kssj = Moment(new Date(this.dateYear.getFullYear(),this.dataQuarter*3-3,1)).format('YYYY-MM-DD');
      this.jssj =  Moment(new Date(this.dateYear.getFullYear(),this.dataQuarter*3,1)).format('YYYY-MM-DD');
    }else if(type == 'range'){
      this.kssj = Moment(this.dateRange[0]).format('YYYY-MM-DD');
      this.jssj =  Moment(this.dateRange[1]).format('YYYY-MM-DD');
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
 
 //获得某月的天数
  getMonthDays(theYear, theMonth) {
     var monthStartDate:any = new Date(theYear, theMonth, 1);
     var monthEndDate:any = new Date(theYear, theMonth + 1, 1);
     var days = (monthEndDate - monthStartDate) / (1000 * 60 * 60 * 24);
     return days;
 }
 
 //获得本季度的开始月份
  getQuarterStartMonth(theMonth?) {
     if(!theMonth) {
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
     if(theMonth == 12) {
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
     if(theQuarterMonth > 11) {
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
