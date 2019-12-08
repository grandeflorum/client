import { Component, OnInit, ViewChildren, QueryList, Input } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd';
import { Router, ActivatedRoute } from '@angular/router';
import { KfxmglService } from '../service/xmgl/kfxmgl.service';
import { LpbglService } from '../service/lpbgl/lpbgl.service';
import { Localstorage } from '../service/localstorage';
import { ValidationDirective } from '../../layout/_directives/validation.directive';
import * as Moment from 'moment';
import * as $ from 'jquery';


@Component({
  selector: 'app-lpbgl',
  templateUrl: './lpbgl.component.html',
  styleUrls: ['./lpbgl.component.scss']
})
export class LpbglComponent implements OnInit {
  @ViewChildren(ValidationDirective) directives: QueryList<ValidationDirective>;
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
  option: any;
  optionParam = "";
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
  lpb: any = {};
  dictionaryObj:any = {};
  companyList: any[] = [];
  companyLoading: boolean = false;

  constructor(
    private msg: NzMessageService,
    private router: Router,
    private kfxmglService: KfxmglService,
    private lpbglService: LpbglService,
    private activatedRoute: ActivatedRoute,
    private localstorage: Localstorage
  ) {
    this.optionParam = this.activatedRoute.snapshot.queryParams.option;
    this.selectId = this.activatedRoute.snapshot.queryParams.selectId;
    this.dictionaryObj = this.localstorage.getObject("dictionary");
  }

  ngOnInit() {

    this.search();
    this.onSearch('');
  }

  async search() {
    this.Loading = true;
    this.option = {
      pageNo: this.pageIndex,
      pageSize: this.pageSize,
      conditions: []
    };

    if (this.type) {
      this.option.conditions.push({ key: 'type', value: this.type });
    }

    if (this.xmmc) {
      this.option.conditions.push({ key: 'xmmc', value: this.xmmc });
    }
    if (this.jzwmc) {
      this.option.conditions.push({ key: 'jzwmc', value: this.jzwmc });
    }
    if (this.optionParam) {
      this.option = JSON.parse(this.optionParam);
      if (this.option.conditions && this.option.conditions.length > 0) {
        this.option.conditions.forEach(element => {
          if (element.key == 'xmmc') {
            this.xmmc = element.value;
          }
          if (element.key == 'jzwmc') {
            this.jzwmc = element.value;
          }
          if (element.key == 'type') {
            this.type = element.value;
          }
        });
      }
      this.pageIndex = this.option.pageNo;
      this.pageSize = this.option.pageSize;
      this.optionParam = "";
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

    var res = await this.lpbglService.getBuildingTableList(this.option);
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


  onChange(m, date) {
    // if(m == 1){
    //   this.kgrq = Moment(date).format('YYYY-MM-DD')
    // }else if(m == 2){
    //   this.jgrq = Moment(date).format('YYYY-MM-DD')
    // }
  }

  selectItem(data) {
    this.selectId = data.id;
  }

  add(m, item?) {
    if (m == 1) {
      this.lpb = {};
      this.isVisible = true;
    } else {
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
        if (!this.pid) {
          this.msg.create('error', '请先保存信息再关联户');
          return false;
        }
        if (this.glType == "houseRental") {
          route = '/houserental/lpbdetail';
        } else if (this.glType == "houseTrade") {
          route = '/contract/houseTrade/lpbdetail';
        } else if (this.glType == "stockTrade") {
          route = '/contract/stockTrade/lpbdetail';
        } else if (this.glType == "zddygl") {
          route = '/zddygl/lpbdetail';
        } else if(this.glType=="stockHouse") {
          route = '/stockHouse/lpbdetail';
        }
      }

      this.router.navigate([route], {
        queryParams: {
          id: item ? item.id : '',
          moduleType: this.type,
          type: m,
          glType: this.glType,
          pid: this.pid,
          option: JSON.stringify(this.option)
        }
      });
    }


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
    // var res = await this.kfxmglService.auditProjects(this.shxxObj);

    // if (res && res.code == 200) {
    //   this.msg.create('success', '审核成功');
    //   this.search();
    //   this.isVisible = false;
    // } else {
    //   this.msg.create('error', '审核失败');
    // }

    if (!this.FormValidation()) {
      return;
    }

    var option = Object.assign({}, this.lpb);
    option.qxdm = '361129';

    var res = await this.lpbglService.saveOrUpdateZRZ(option);

    if (res && res.code == 200) {
      this.msg.create('success', '保存成功');
      this.search();
      this.isVisible = false;
    } else {
      this.msg.create('error', '保存失败');
    }

  }


  handleCancel() {
    this.isVisible = false;
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

  async onSearch(evt) {
    this.companyLoading = true;
    let option = {
      pageNo: 1,
      pageSize: 10,
      conditions: []
    };

    if (evt) {
      option.conditions.push({ key: 'xmmc', value: evt });
    }



    let res = await this.kfxmglService.getProjectList(option);

    if (res) {
      this.companyList = res.msg.currentList;
      this.companyLoading = false;
    }

  }

  selectChange(evt) {
    this.lpb.xmid = evt;

    if (evt) {
      let select = this.companyList.find(x => evt == x.id);

      if (select) {
        this.lpb.xmmc = select.xmmc;
      }
    } else {
      this.lpb.xmmc = null;
    }
  }

 async deleteZrz(id){
  var res = await this.lpbglService.deleteZRZ(id);
  if (res && res.code == 200) {
    this.msg.create('success', '删除成功');
    this.search();
  } else {
    this.msg.create('error', res.msg);
  }
 }

  ngAfterViewInit() {
    var that = this;
    $(window).resize(function () {
      that.calculationHeight()
    })
  }

}
