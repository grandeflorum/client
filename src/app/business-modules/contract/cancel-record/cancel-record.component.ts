import { Component, OnInit, ViewChildren, QueryList } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd';
import { Router } from '@angular/router';
import * as Moment from 'moment';
import * as $ from 'jquery';
import { HouseTradeService } from "../../service/contract/house-trade.service";
import { UtilitiesSercice } from '../../service/common/utilities.services';

@Component({
  selector: 'app-cancel-record',
  templateUrl: './cancel-record.component.html',
  styleUrls: ['./cancel-record.component.scss']
})
export class CancelRecordComponent implements OnInit {

  constructor(
    private msg: NzMessageService,
    private router: Router,
    private houseTradeService: HouseTradeService,
    private utilitiesSercice: UtilitiesSercice
  ) { }

  ngOnInit() {
    this.userinfo = JSON.parse(sessionStorage.getItem("userinfo"));
    this.search();
  }

  tabs = [
    { name: '商品房注销记录', index: 0 },
    { name: '存量房注销记录', index: 1 }
  ]
  tabsetIndex = 0;

  tabsetChange(m) {
    this.tabsetIndex = m;
  }

  pageIndex: any = 1;
  totalCount: any;
  pageSize: any = 10;
  Loading = false;
  tableIsScroll = null;
  sortList: any = [];
  selectId: any = '';
  dataSet = [];

  
  isVisible: any = false;
  isOkLoading: any = false;

  auditProjectId: any = [];
  auditName: any;
  auditResultVisible:any=true;
  auditPeople:any;
  auditdate:any;

  isAllDisplayDataChecked = false;
  isIndeterminate = false;
  listOfDisplayData = [];
  listOfAllData = [];
  mapOfCheckedId: { [key: string]: boolean } = {};
  numberOfChecked = 0;

  userinfo: any = {};

 

  async search() {
    this.Loading = true;
    let option = {
      pageNo: this.pageIndex,
      pageSize: this.pageSize,
      conditions: []
    };

    // if (this.jzwmc) {
    //   option.conditions.push({ key: 'jzwmc', value: this.jzwmc });
    // }
    // if (this.xmmc) {
    //   option.conditions.push({ key: 'xmmc', value: this.xmmc });
    // }
    // if (this.currentStatus || this.currentStatus === "0") {
    //   option.conditions.push({ key: 'currentStatus', value: this.currentStatus });
    // }
    option.conditions.push({ key: 'sort', value: this.sortList });
    this.operateData(option);
    this.Loading = false;
    this.calculationHeight();
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

  async operateData(option) {
    let res = await this.houseTradeService.getHouseTradeList(option);

    if (res && res.code == 200) {

      this.dataSet = res.msg.currentList;
      this.totalCount = res.msg.recordCount;

      this.listOfAllData.forEach(item => (this.mapOfCheckedId[item.id] = false));
      this.refreshStatus();

      this.calculationHeight();
    } else {
      this.msg.create('error', '查询失败');
    }
  }

  selectItem(data) {
    this.selectId = data.id;
  }

  calculationHeight() {
    const bodyHeight = $('body').height()
    const height = this.dataSet.length * 50;
    if (height > bodyHeight - 350) {
      this.tableIsScroll = { y: bodyHeight - 350 + 'px' }
    } else {
      this.tableIsScroll = null
    }
  }


  ngAfterViewInit() {
    var that = this;
    $(window).resize(function () {
      that.calculationHeight()
    })
  }


}
