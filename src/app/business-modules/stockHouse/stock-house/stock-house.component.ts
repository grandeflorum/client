import { Component, OnInit } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd';
import { Router , ActivatedRoute } from '@angular/router';
import * as Moment from 'moment';
import * as $ from 'jquery';
import { StockHouseService } from "../../service/stockHouse/stock-house.service";
import { Localstorage } from '../../service/localstorage';

@Component({
  selector: 'app-stock-house',
  templateUrl: './stock-house.component.html',
  styleUrls: ['./stock-house.component.scss']
})
export class StockHouseComponent implements OnInit {
  pageIndex: any = 1;
  totalCount: any;
  pageSize: any = 10;
  Loading = false;
  tableIsScroll = null;
  sortList: any = [];
  selectId: any = '';
  cqrxm = '';
  cqzh = '';
  auditType = '';
  dataSet = [];


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


  userinfo: any = {};

  fxList=[];

  constructor(
    private msg: NzMessageService,
    private router: Router,
    private localstorage: Localstorage,
    private stockHouseService: StockHouseService,
    private activatedRoute:ActivatedRoute
  ) { }

  //添加权限
  canzsgc: boolean = false;
  cantjsh: boolean = false;
  cansh: boolean = false;
  canecsh: boolean = false;


  getRoles() {
    let roles = this.localstorage.getObject("roles");

    if (roles) {
      if (roles.some(x => x == '管理员')) {
        this.canzsgc = true;
        this.cantjsh = true;
        this.cansh = true;
        this.canecsh = true;

      }

      if (roles.some(x => x == '领导')) {
        this.canecsh = true;
      }

      if (roles.some(x => x == '录入员')) {
        this.canzsgc = true;
        this.cantjsh = true;
      }

      if (roles.some(x => x == '审核员')) {
        this.cansh = true;
      }

      if (roles.some(x => x == '开发企业') || roles.some(x => x == '经纪公司')) {
        this.canzsgc = true;
        this.cantjsh = true;
      }
    }
  }

  ngOnInit() {
    this.getRoles();
    this.userinfo = JSON.parse(sessionStorage.getItem("userinfo"));
    this.shxxObj.wfAudit.shry = this.userinfo ? this.userinfo.realname : null;
    this.fxList= this.localstorage.getObject("dictionary").fx;

    var isGoBack = this.activatedRoute.snapshot.queryParams.isGoBack;

    if(isGoBack){
      this.cqrxm = this.stockHouseService.pageCache.cqrxm;
      this.cqzh = this.stockHouseService.pageCache.cqzh;
      this.auditType = this.stockHouseService.pageCache.auditType;
      this.selectId = this.stockHouseService.pageCache.selectId;
      this.pageIndex = this.stockHouseService.pageCache.pageIndex;
      this.pageSize = this.stockHouseService.pageCache.pageSize;
    }

    this.search();
  }

  async search() {
    this.Loading = true;
    let option = {
      pageNo: this.pageIndex,
      pageSize: this.pageSize,
      conditions: []
    };

    if (this.cqrxm) {
      option.conditions.push({ key: 'cqrxm', value: this.cqrxm });
    }
    if (this.cqzh) {
      option.conditions.push({ key: 'cqzh', value: this.cqzh });
    }
    if (this.auditType || this.auditType === "0") {
      option.conditions.push({ key: 'auditType', value: this.auditType });
    }
    option.conditions.push({ key: 'sort', value: this.sortList });
    this.operateData(option);
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
    this.cqrxm = '';
    this.cqzh = '';
    this.auditType = '';
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
    let res = await this.stockHouseService.getStockHouseList(option);

    if (res && res.code == 200) {
      this.Loading = false;
      this.dataSet = res.msg.currentList;
      this.totalCount = res.msg.recordCount;

      this.dataSet.forEach(element => {
        this.fxList.forEach(fxdic=>{
          if(element.fx==fxdic.code){
            element.fx=fxdic.name;
          }
        })
      });

      this.listOfAllData.forEach(item => (this.mapOfCheckedId[item.id] = false));
      this.refreshStatus();

      this.calculationHeight();
    } else {
      this.Loading = false;
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

    let res = await this.stockHouseService.deleteStockHouseByIds(datas);

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

  async auditCompany(id, type) {

    let res = await this.stockHouseService.auditStockHouseById(id, type);

    if (res && res.code == 200) {
      this.msg.create('success', '提交审核成功');
      this.search();
    } else {
      this.msg.create('error', '提交审核失败');
    }
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

      this.stockHouseService.pageCache = {
        cqrxm:this.cqrxm,
        cqzh:this.cqzh,
        auditType:this.auditType,
        selectId:item?item.id:'',
        pageIndex:1,
        pageSize:10
      }

    this.router.navigate(['/stockHouse/detail'], {
      queryParams: {
        id: item ? item.id : '',
        type: m
      }
    });
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

  //批量审核 || 单个审核
  async moreAudit(item?) {

    this.shxxObj = {
      ids: [],
      wfAudit: {
        shjg: "1",
        shry: this.userinfo ? this.userinfo.realname : null,
        bz: '',
        shrq: new Date()
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
  shxm(data: any = {}) {
    this.isVisible = true;
    this.shxxObj = {
      ids: [],
      wfAudit: {
        shjg: "1",
        shry: this.userinfo ? this.userinfo.realname : null,
        bz: '',
        shrq: null
      },
      type: 0
    }
    if (this.twoAuditPD) {
      this.shxxObj.ids.push(data.id);
      this.shxxObj.type = 1;
    }
  }

  //审核
  async handleOk() {
    var res = await this.stockHouseService.auditStockHouses(this.shxxObj);
    if (res && res.code == 200) {
      this.msg.create('success', '审核成功');
      this.isVisible = false;
      this.search();

      this.twoAuditPD = false;
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

  //添加二次审核

  twoAuditPD: boolean = false;

  twoAudit(data) {
    this.twoAuditPD = true;

    this.shxm(data);
  }

}
