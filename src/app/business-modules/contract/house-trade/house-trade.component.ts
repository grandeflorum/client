import { Component, OnInit } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd';
import { Router } from '@angular/router';
import * as Moment from 'moment';
import * as $ from 'jquery';
import { HouseTradeService } from "../../service/contract/house-trade.service";

@Component({
  selector: 'app-house-trade',
  templateUrl: './house-trade.component.html',
  styleUrls: ['./house-trade.component.scss']
})
export class HouseTradeComponent implements OnInit {

  pageIndex: any = 1;
  totalCount: any;
  pageSize: any = 10;
  Loading = false;
  tableIsScroll = null;
  sortList: any = [];
  selectId: any = '';
  kfqymc = '';
  xmmc = '';
  currentStatus = '';
  dataSet=[];


  isVisible = false;


  isAllDisplayDataChecked = false;
  isIndeterminate = false;
  listOfDisplayData = [];
  listOfAllData = [];
  mapOfCheckedId: { [key: string]: boolean } = {};
  numberOfChecked = 0;

  constructor(
    private msg: NzMessageService,
    private router: Router,
    private houseTradeService: HouseTradeService
  ) { }

  ngOnInit() {
    this.search();
  }

  async search() {
    this.Loading = true;
    let option = {
      pageNo: this.pageIndex,
      pageSize: this.pageSize,
      conditions: []
    };

    if (this.kfqymc) {
      option.conditions.push({ key: 'kfqymc', value: this.kfqymc });
    }
    if (this.xmmc) {
      option.conditions.push({ key: 'xmmc', value: this.xmmc });
    }
    if (this.currentStatus||this.currentStatus==="0") {
      option.conditions.push({ key: 'currentStatus', value: this.currentStatus });
    }
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
    this.kfqymc = '';
    this.xmmc = '';
    this.currentStatus = '';
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

  async delete(datas) {

    if (datas && datas.length == 0) {
      this.msg.create("warning", "请选择要删除的企业");
      return;
    }

    let res = await this.houseTradeService.deleteHouseTradeByIds(datas);

    if (res && res.code == 200) {
      this.msg.create('success', '删除成功');
      this.search();
    } else {
      this.msg.create('error', '删除失败');
    }
  }

  btachDelete() {

    let datas = [];

    if (this.listOfDisplayData.length > 0) {
      this.listOfDisplayData.forEach(element => {
        if (this.mapOfCheckedId[element.id]) {
          datas.push(element.id);
        }
      });
    }


    this.delete(datas);

  }


  add(m, item?) {
    // switch (m) {
    //   case 1://添加
    //     break;
    //     case 2://查看
    //     break;
    //     case 3://编辑
    //     break;
    //   default:
    //     break;
    // }

    this.router.navigate(['/stockHouse/detail'], {
      queryParams: {
        id: item ? item.id : '',
        type: m
      }
    });
  }


  calculationHeight() {
    const bodyHeight = $('body').height()
    const height = this.dataSet.length * 40;
    if (height > bodyHeight - 450) {
      this.tableIsScroll = { y: bodyHeight - 400 + 'px' }
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
