import { Component, OnInit, ViewChildren, QueryList } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd';
import { Router } from '@angular/router';
import * as Moment from 'moment';
import * as $ from 'jquery';
import { HouseTradeService } from "../../service/contract/house-trade.service";
import { ValidationDirective } from 'src/app/layout/_directives/validation.directive';
import { UtilitiesSercice } from '../../service/common/utilities.services';


@Component({
  selector: 'app-house-trade',
  templateUrl: './house-trade.component.html',
  styleUrls: ['./house-trade.component.scss']
})
export class HouseTradeComponent implements OnInit {

  @ViewChildren(ValidationDirective) directives: QueryList<ValidationDirective>;
  pageIndex: any = 1;
  totalCount: any;
  pageSize: any = 10;
  Loading = false;
  tableIsScroll = null;
  sortList: any = [];
  selectId: any = '';
  jzwmc = '';
  xmmc = '';
  currentStatus = '';
  dataSet = [];

  auditList: any = [
    { name: "通过", code: 1 },
    { name: "不通过", code: 2 }
  ];
  auditStatusList: any = [
    { name: "全部", code: "" },
    { name: "未提交", code: "0" },
    { name: "待受理", code: "1" },
    { name: "待初审", code: "2" },
    { name: "待核定", code: "3" },
    { name: "待登簿", code: "4" },
    { name: "已备案", code: "5" },

  ]
  //审核对象
  auditObj: any = {
    shrq: new Date()
  };

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

  constructor(
    private msg: NzMessageService,
    private router: Router,
    private houseTradeService: HouseTradeService,
    private utilitiesSercice: UtilitiesSercice
  ) { }

  ngOnInit() {
    this.userinfo = JSON.parse(sessionStorage.getItem("userinfo"));
    this.auditObj.shry = this.userinfo ? this.userinfo.realname : null;
    this.search();
  }

  async search() {
    this.Loading = true;
    let option = {
      pageNo: this.pageIndex,
      pageSize: this.pageSize,
      conditions: []
    };

    if (this.jzwmc) {
      option.conditions.push({ key: 'jzwmc', value: this.jzwmc });
    }
    if (this.xmmc) {
      option.conditions.push({ key: 'xmmc', value: this.xmmc });
    }
    if (this.currentStatus || this.currentStatus === "0") {
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
    this.jzwmc = '';
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

    this.router.navigate(['/contract/houseTrade/detail'], {
      queryParams: {
        id: item ? item.id : '',
        type: m
      }
    });
  }

  //提交审核
  async auditHouseTrade(id, type) {

    let res = await this.houseTradeService.auditHouseTradeById(id, type);

    if (res && res.code == 200) {
      this.msg.create('success', '提交审核成功');
      this.search();
    } else {
      this.msg.create('error', '提交审核失败');
    }
  }


  //审核
  audit(data) {

    this.isVisible = true;
    switch (data.currentStatus) {
      case 1:
        this.auditName = "受理";
        this.auditResultVisible=true;
        this.auditPeople="审核人";
        this.auditdate="审核日期";
        break;
      case 2:
        this.auditName = "初审";
        this.auditResultVisible=true;
        this.auditPeople="审核人";
        this.auditdate="审核日期";
        break;
      case 3:
        this.auditName = "核定";
        this.auditResultVisible=true;
        this.auditPeople="审核人";
        this.auditdate="审核日期";
        break;
      case 4:
        this.auditName = "登簿";
        this.auditResultVisible=true;
        this.auditPeople="审核人";
        this.auditdate="审核日期";
        break;
      case 5:
        this.auditName = "注销";
        this.auditResultVisible=false;
        this.auditPeople="注销人";
        this.auditdate="注销日期";
        break;
      default:
        this.auditName = "审核";
        this.auditResultVisible=true;
        this.auditPeople="审核人";
        this.auditdate="审核日期";
        break;
    }
    this.isOkLoading = false;

    this.auditProjectId = [];
    this.auditProjectId.push(data.id);

    this.auditObj = {
      shrq: new Date(),
      shry: this.userinfo ? this.userinfo.realname : null
    };

  }

  handleCancel() {
    this.isVisible = false;
  }

  //批量审核
  btachAudit() {
    this.auditProjectId = [];

    let flag = false;
    if (this.listOfDisplayData.length > 0) {
      this.listOfDisplayData.forEach(element => {
        if (this.mapOfCheckedId[element.id]) {
          if (element.auditType != 1) {
            flag = true;
          }
          this.auditProjectId.push(element.id);
        }
      });
    }

    if (this.auditProjectId.length == 0) {

      this.msg.create("warning", "请选择要审核的企业");
      return;
    }

    if (flag) {
      this.msg.create("warning", "只能选择待审核的企业进行审核");
      return;
    }

    this.isVisible = true;
    this.isOkLoading = false;


  }

  //审核保存
  async handleOk() {

    if (!this.FormValidation()) {
      return;
    }

    this.isOkLoading = true;
    var data = {
      ids: this.auditProjectId,
      wfAudit: this.auditObj
    }

    let res = await this.houseTradeService.btachAuditHouseTrade(data);
    if (res && res.code == 200) {
      this.msg.create('success', '审核成功');
      this.isOkLoading = false;
      this.isVisible = false;
      this.search();
    } else {
      this.msg.create('error', '审核失败');
    }

  }

  FormValidation() {
    let isValid = true;
    this.directives.forEach(d => {
      if (!d.validationValue()) {
        isValid = false;
      }
    });
    return isValid;
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

  //打印
  print(data) {

    let url = AppConfig.Configuration.baseUrl + "/HouseTrade/printHt?id=" + data.id + "&type=1";
    url = this.utilitiesSercice.wrapUrl(url);
    window.open(url, '_blank');
  }

  perview(data) {
    let url = AppConfig.Configuration.baseUrl + "/HouseTrade/printHt?id=" + data.id + "&type=2";
    window.open('assets/usermanual/web/viewer.html?url=' + this.utilitiesSercice.wrapUrl(url), "_blank");
  }

}
