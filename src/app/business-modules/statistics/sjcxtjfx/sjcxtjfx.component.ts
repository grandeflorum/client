import { Component, OnInit, ViewChildren, QueryList, Input } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd';
import { Router } from '@angular/router';
import { KfxmglService } from '../../service/xmgl/kfxmgl.service';
import { LpbglService } from '../../service/lpbgl/lpbgl.service';
import { Localstorage } from '../../service/localstorage';
import * as Moment from 'moment';
import * as $ from 'jquery';
import * as echarts from 'echarts';

@Component({
  selector: 'app-sjcxtjfx',
  templateUrl: './sjcxtjfx.component.html',
  styleUrls: ['./sjcxtjfx.component.scss']
})
export class SjcxtjfxComponent implements OnInit {
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
  xmmc = '';
  jzwmc = '';

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

  constructor(
    private msg: NzMessageService,
    private router: Router,
    private kfxmglService: KfxmglService,
    private lpbglService: LpbglService,
    private localstorage: Localstorage,
  ) { 
    this.dictionaryObj = this.localstorage.getObject("dictionary");
  }

  ngOnInit() {
   this.search();
  }

  tabsetChange(m) {
    this.tabsetIndex = m;
  }

  echartChange(m){
    this.btnIndex = m;
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


    var res = await this.lpbglService.getBuildingTableList(option);
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

  reset() {
    this.xmmc = '';
    this.jzwmc = '';
 

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
