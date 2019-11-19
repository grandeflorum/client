import { Component, OnInit, ViewChildren, QueryList, Input } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd';
import { Router } from '@angular/router';
import { KfxmglService } from '../../service/xmgl/kfxmgl.service';
import { LpbglService } from '../../service/lpbgl/lpbgl.service';
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
  tableIsScroll = null;
  dataSet: any = [];
  sortList: any = [];
  selectId: any = '';
  xmmc = '';
  jzwmc = '';
  auditType = "";
  kgrq = '';
  jgrq = '';
  isVisible = false;

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
            data : ['1', '2', '3', '4', '5', '6', '7' ,'8','9','10','11','12'],
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
            data:[10, 52, 200, 334, 390, 330, 220, 150 ,120 , 140, 50 ,100]
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
    private lpbglService: LpbglService
  ) { }

  ngOnInit() {
    setTimeout(() => {
      this.setXsEchart();
    }, 500);

    this.search();
  }

  tabsetChange(m) {
    this.tabsetIndex = m;
  }

  echartChange(m){
    this.btnIndex = m;
  }

  setXsEchart(){
    this.myChart = echarts.init(document.getElementById("xs_echart"));
    this.myChart.off('click');
    this.myChart.setOption(this.option)
  }

  async search() {
    this.Loading = true;
    let option = {
      pageNo: this.pageIndex,
      pageSize: this.pageSize,
      conditions: []
    };

    if (this.type) {
      option.conditions.push({ key: 'type', value: this.type });
    }

    if (this.xmmc) {
      option.conditions.push({ key: 'xmmc', value: this.xmmc });
    }
    if (this.jzwmc) {
      option.conditions.push({ key: 'jzwmc', value: this.jzwmc });
    }
    // if (this.auditType||this.auditType==="0") {
    //   option.conditions.push({ key: 'auditType', value: this.auditType });
    // }
    // if (this.kgrq) {
    //   option.conditions.push({ key: 'kgrq', value: this.kgrq });
    // }
    // if (this.jgrq) {
    //   option.conditions.push({ key: 'jgrq', value: this.jgrq });
    // }
    //option.conditions.push({ key: 'sort', value: this.sortList });

    var res = await this.lpbglService.getBuildingTableList(option);
    this.Loading = false;
    if (res.code == 200) {
      this.dataSet = res.msg.currentList;
      this.totalCount = res.msg.recordCount;
      this.calculationHeight();
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

  reset() {
    this.xmmc = '';
    this.jzwmc = '';
    this.auditType = "0";
    this.kgrq = '';
    this.jgrq = '';
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


  onChange(m) {
  
  }

  selectItem(data) {
    this.selectId = data.id;
  }

  add(m, item?) {

    var route = "/lpbgl/detail";

    switch (this.type) {
      case 'dy':
        route = '/zjgcdygl/detail';
        break;
      case 'cf':
        route = '/ycfgl/detail';
        break;
      default:
        break;
    }

    if (this.glType) {
      if(!this.pid){
        this.msg.create('error', '请先保存信息再关联户');
        return false;
      }
      if(this.glType=="houseRental"){
        route = '/houserental/lpbdetail';
      }else if(this.glType=="houseTrade"){
        route = '/contract/houseTrade/lpbdetail';
      }else if(this.glType=="stockTrade"){
        route = '/contract/stockTrade/lpbdetail';
      }
    }

    this.router.navigate([route], {
      queryParams: {
        id: item ? item.id : '',
        moduleType: this.type,
        type: m,
        glType: this.glType,
        pid: this.pid
      }
    });
  }


  calculationHeight() {
    const bodyHeight = $('body').height()
    const height = this.dataSet.length * 50;
    if (height > bodyHeight - 300) {
      this.tableIsScroll = { y: bodyHeight - 300 + 'px' }
    } else {
      this.tableIsScroll = null
    }
  }

  //删除
  async btachDelete(item?) {
    var ids = [];
    if (item) {//单个删除
      ids.push(item.id);
    } else {//批量删除
      if (this.listOfDisplayData.length > 0) {
        this.listOfDisplayData.forEach(element => {
          if (this.mapOfCheckedId[element.id]) {
            ids.push(element.id);
          }
        });
      }
    }

    if (ids.length == 0) {
      this.msg.warning('请选择需要删除的项目');
      return;
    }

    var res = await this.kfxmglService.deleteProjectByIds(ids);
    if (res && res.code == 200) {
      this.msg.create('success', '删除成功');
      this.search();
    } else {
      this.msg.create('error', '删除失败');
    }
  }

  //提交审核
  async auditSubmit(item, type) {
    var res = await this.kfxmglService.auditProjectById(item.id, type);
    if (res && res.code == 200) {
      this.msg.create('success', '提交审核成功');
      this.search();
    } else {
      this.msg.create('error', '提交审核失败');
    }
  }

  //批量审核 || 单个审核
  async moreAudit(item?) {

    this.shxxObj = {
      ids: [],
      wfAudit: {
        shjg: "1",
        shry: '',
        bz: '',
        shrq: null
      }
    }
    this.shxxObj.ids = [];

    if (item) {
      this.shxxObj.ids.push(item.id);
    } else {
      if (this.listOfDisplayData.length > 0) {
        this.listOfDisplayData.forEach(element => {
          if (this.mapOfCheckedId[element.id]) {
            this.shxxObj.ids.push(element.id);
          }
        });
      }
    }

    if (this.shxxObj.ids.length == 0) {
      this.msg.warning('请选择需要审核的项目');
      return;
    }

    this.isVisible = true;
  }

  //打开审核模态框
  shxm() {
    this.isVisible = true;
    this.shxxObj = {
      ids: [],
      wfAudit: {
        shjg: "1",
        shry: '',
        bz: '',
        shrq: null
      }
    }
  }

  //审核
  async handleOk() {
    var res = await this.kfxmglService.auditProjects(this.shxxObj);

    if (res && res.code == 200) {
      this.msg.create('success', '审核成功');
      this.search();
      this.isVisible = false;
    } else {
      this.msg.create('error', '审核失败');
    }
  }


  handleCancel() {
    this.isVisible = false;
  }

  ngAfterViewInit() {
    var that = this;
    $(window).resize(function () {
      that.calculationHeight()
    })
  }

}
