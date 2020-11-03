import {
  Component,
  OnInit,
  ViewChildren,
  QueryList,
  ViewChild,
  TemplateRef
} from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd';
import { Router, ActivatedRoute } from '@angular/router';
import { ValidationDirective } from '../../../../layout/_directives/validation.directive';
import { Localstorage } from '../../../service/localstorage';
import { KfxmglService } from '../../../service/xmgl/kfxmgl.service';
import { FileService } from '../../../service/file/file.service';
import { UtilitiesSercice } from '../../../service/common/utilities.services';
import { LpbglService } from '../../../service/lpbgl/lpbgl.service';
import { HouseTradeService } from '../../../service/contract/house-trade.service';
import * as Moment from 'moment';
import * as $ from 'jquery';
import Viewer from 'viewerjs';

@Component({
  selector: 'app-house-trade-detail',
  templateUrl: './house-trade-detail.component.html',
  styleUrls: ['./house-trade-detail.component.scss']
})
export class HouseTradeDetailComponent implements OnInit {

  constructor(
    private msg: NzMessageService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private localstorage: Localstorage,
    private fileService: FileService,
    private utilitiesSercice: UtilitiesSercice,
    private houseTradeService: HouseTradeService,
    private lpbglService: LpbglService
  ) {
    const type = this.activatedRoute.snapshot.queryParams.type;
    this.detailObj.id = this.activatedRoute.snapshot.queryParams.id;
    this.moduleType = this.activatedRoute.snapshot.queryParams.moduleType;
    const pid = this.activatedRoute.snapshot.queryParams.pid;
    this.detailObj.id = pid ? pid : this.detailObj.id;
    // 直接从楼盘表页面跳转过来备案
    this.hid = this.activatedRoute.snapshot.queryParams.hid;

    const glType = this.activatedRoute.snapshot.queryParams.glType;
    this.tabsetIndex = glType ? 3 : 0;

    this.bg = this.activatedRoute.snapshot.queryParams.bg;

    if (type == 2) {
      this.isDisable = true;
      this.tabs = [
        { name: '合同信息', index: 0 },
        { name: '合同委托', index: 1 },
        { name: '附件', index: 2 },
        { name: '关联企业', index: 3 }
      ];

      this.associatedCompanyShow = true;
    } else if (type == 4) {
      this.tabs.push({ name: '关联户信息', index: 4 });
    }

    switch (type) {
      case '1': // 添加
        this.isDisable = false;
        this.isWfaudit = false;
        break;
      case '2': // 查看
        this.isDisable = true;
        this.isWfaudit = false;
        break;
      case '3': // 编辑
        this.isDisable = false;
        this.isWfaudit = true;
        break;
      default:
        break;
    }
  }

  @ViewChildren(ValidationDirective) directives: QueryList<ValidationDirective>;
  @ViewChild('uploadComponent', { static: false }) uploadComponent;

  downLoadurl = AppConfig.Configuration.baseUrl + '/FileInfo/download';
  tabs = [
    { name: '合同信息', index: 0 },
    { name: '合同委托', index: 1 },
    { name: '附件', index: 2 },
    { name: '关联户信息', index: 3 },
    { name: '关联企业', index: 4 }
  ];
  tabsetIndex = 0;
  isDisable = false;
  detailObj: any = {};
  hid: '';
  selectId = -1;
  fjList = [];
  pageIndex: any = 1;
  totalCount: any = 0;
  pageSize: any = 10;
  Loading = false;
  tableIsScroll = null;
  isAllDisplayDataChecked = false;
  isIndeterminate = false;
  listOfDisplayData = [];
  listOfAllData = [];
  mapOfCheckedId: { [key: string]: boolean } = {};
  numberOfChecked = 0;
  isVisible = false;
  dictionaryObj: any = {};
  isImgVisible = false;
  currentImg = '';

  selectedHu: any = {};
  moduleType = '';
  fileType = 0;

  showBalc = false;
  timeline = [
    { name: '基础信息录入', state: 0 },
    { name: '受理', state: 1 },
    { name: '初审', state: 2 },
    { name: '核定', state: 3 },
    { name: '登簿', state: 4 },
    { name: '生成合同', state: 5 }
  ];
  houseTypeList = [
    { code: 1, name: '现售' },
    { code: 2, name: '预售' }
  ];
  fileTypeList = [];
  fileTypeIndex = 0;

  rowSpan: any = 0;
  lpbList: any = [];
  selectH: any = '';

  // 合同模板集合
  cashSalesTemplate: any = {};
  advanceSalesTemplate: any = {};
  // (两种合同模板的区别显示)
  // 现售
  isXS = false;
  // 预售
  isYS = false;

  isbusy = false;
  bg = '';

  btShow = false;
  gyqrShow = false;
  associatedCompanyShow = false;
  isOkLoading = false;


  // 审核记录
  pagedateIndex: any = 1;
  totaldateCount: any;
  pagedateSize: any = 10;
  dateLoading = false;
  sortList: any = [];
  dataSet = [];
  isWfaudit = false;

  pagedateIndexChange(num) {
    this.pagedateIndex = num;
    this.checksearch();
  }

  pagedateSizeChange(num) {
    this.pagedateSize = num;
    this.pagedateIndex = 1;
    this.checksearch();
  }

  async checksearch() {
    this.dateLoading = true;
    let option = {
      pageNo: this.pagedateIndex,
      pageSize: this.pagedateSize,
      conditions: []
    };
    option.conditions.push({ key: 'projectid', value: this.detailObj.id });
    option.conditions.push({ key: 'sort', value: this.sortList });
    this.operateAuditData(option);
    this.calculationHeight();
  }

  checkPageDataChange($event): void {
    this.listOfDisplayData = $event;
    this.refreshStatus();
  }

  async operateAuditData(option) {
    let res = await this.houseTradeService.getWFAuditListByProjectid(option);

    if (res && res.code == 200) {
      this.dateLoading = false;
      console.log(res);
      this.dataSet = res.msg.currentList;
      this.totaldateCount = res.msg.recordCount;

      // this.listOfAllData.forEach(item => (this.mapOfCheckedId[item.id] = false));
      this.refreshStatus();

      this.calculationHeight();
    } else {
      this.Loading = false;
      this.msg.create('error', '查询失败');
    }
  }



  ngOnInit() {
    // this.isbtShow();
    this.dictionaryObj = this.localstorage.getObject('dictionary');

    if (this.detailObj.id) {
      this.getDetail();
    } else if (this.hid) {
      this.detailObj.houseId = this.hid;
      this.getHInfo();
    }
    this.search();
    this.checksearch();
  }

  async getDetail() {
    const res = await this.houseTradeService.getHouseTradeById(this.detailObj.id);
    if (res && res.code == 200) {
      this.detailObj = res.msg;
      this.houseTypeChange(this.detailObj.houseType);
      // console.log(this.detailObj);

      if (this.detailObj.wfAuditList.length > 0) {
        this.detailObj.wfAuditList.forEach((v, k) => {
          if (v.shrq) {
            v.shrq = Moment(v.shrq).format('YYYY-MM-DD');
          }
        });
      }

      if (this.detailObj.ljzid) {
        this.selectH = this.detailObj.houseId;
        this.getLpb(this.detailObj.ljzid);
      }

      if (this.detailObj.houseType == 1) {
        this.cashSalesTemplate = this.detailObj.cashSalesTemplate;    // 现售
      }
      if (this.detailObj.houseType == 2) {
        this.advanceSalesTemplate = this.detailObj.advanceSalesTemplate;    // 预售
      }
    } else {
      this.msg.create('error', '内部服务错误');
    }
  }

  async getHInfo() {
    const res = await this.houseTradeService.getHInfo(this.detailObj.houseId);
    if (res && res.code == 200) {
      this.detailObj = res.msg;

      if (this.detailObj.ljzid) {
        this.selectH = this.detailObj.houseId;
        this.getLpb(this.detailObj.ljzid);
      }
    } else {
      this.msg.create('error', '内部服务错误');
    }
  }

  async getLpb(id) {
    this.rowSpan = 0;

    const res = await this.lpbglService.getLjz(id);

    if (res && res.code == 200) {
      this.lpbList = res.msg;
      this.lpbList.dyList.forEach((v, k) => {
        this.rowSpan += v.rowSpan;
      });
    }
  }
  async linkH() {
    if (!this.selectH) {
      this.msg.create('warning', '请先选择户');
      return;
    }

    const res = await this.houseTradeService.linkH(
      this.detailObj.id,
      this.selectH
    );
    if (res && res.code == 200) {
      this.lpbList.cList.forEach(cinfo => {
        if (cinfo && cinfo.hList.length > 0) {
          cinfo.hList.forEach(hinfo => {
            if (hinfo.id == this.selectH) {
              this.detailObj.dyh = hinfo.dyh;
              this.detailObj.ch = hinfo.ch;
              this.detailObj.fh = hinfo.mph;
            }
          });
        }
      });
      this.msg.create('success', '关联成功');
    } else {
      this.msg.create('error', '关联失败');
    }
  }

  fileTypeIndexChange(index) {
    this.fileTypeIndex = index;
    this.fileType = this.fileTypeList[this.fileTypeIndex].code;
    this.getFileList();
  }

  selectedHuChange(item) {
    this.selectedHu = item;
  }

  async search() {
    const option = {
      id: this.detailObj.id,
      type: 'htfj'
    };

    const res = await this.fileService.getAttachDicCount(option);
    if (res && res.code == 200) {
      this.fileTypeList = res.msg;
      this.fileType = this.fileTypeList[this.fileTypeIndex].code;
      this.getFileList();
    }
  }

  async getFileList() {
    const option2 = {
      pageNo: this.pageIndex,
      pageSize: this.pageSize,
      conditions: [
        { key: 'refid', value: this.detailObj.id },
        { key: 'type', value: this.fileType }
      ]
    };
    if (!this.detailObj.id) {
      this.fjList = [];
      this.totalCount = 0;
    } else {
      const res = await this.fileService.getFileListByRefidAndType(option2);

      if (res.code == 200) {
        this.fjList = res.msg.currentList;
        this.totalCount = res.msg.recordCount;
      }
    }

    this.calculationHeight();
    this.operateData();
  }

  tabsetChange(m) {
    this.tabsetIndex = m;
  }

  cancel() {
    const route = '/contract/houseTrade';

    // switch (this.moduleType) {
    //   case 'dy':
    //     route = '/zjgcdygl';
    //     break;
    //   case 'cf':
    //     route = '/ycfgl';
    //     break;
    //   default:
    //     break;
    // }
    this.router.navigate([route], { queryParams: { isGoBack: true } });
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
      this.listOfDisplayData
        .filter(item => !item.disabled)
        .some(item => this.mapOfCheckedId[item.id]) &&
      !this.isAllDisplayDataChecked;
    this.numberOfChecked = this.listOfAllData.filter(
      item => this.mapOfCheckedId[item.id]
    ).length;

    // for (const id in this.mapOfCheckedId) {
    //   console.log(id);
    // }
  }

  checkAll(value: boolean): void {
    this.listOfDisplayData
      .filter(item => !item.disabled)
      .forEach(item => (this.mapOfCheckedId[item.id] = value));
    this.refreshStatus();
  }

  operateData(): void {
    setTimeout(() => {
      this.listOfAllData.forEach(
        item => (this.mapOfCheckedId[item.id] = false)
      );
      this.refreshStatus();
    }, 1000);
  }

  onChange(m, date) {
    // if(m == 1){
    //   this.detailObj.kgrq = Moment(date).format('YYYY-MM-DD')
    // }else if(m == 2){
    //   this.detailObj.jgrq = Moment(date).format('YYYY-MM-DD')
    // }
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

  selectItem(data) {
    this.selectId = data.id;
  }

  async gyqkSelectChange() {
    // if (this.detailObj.gyqk !== 1) {
    //   this.gyqrShow = true;
    // } else {
    //   this.gyqrShow = false;
    // }
  }

  async save() {
    if (!this.FormValidation()) {
      return;
    }
    if (!this.detailObj.id) {
      delete this.detailObj.id;
    }
    // if (this.detailObj.gyqk != 1) {
    //   if (
    //     !this.detailObj.relationShips ||
    //     this.detailObj.relationShips.length == 0
    //   ) {
    //     this.msg.create('error', '共有方式不是单独所有时需填写共有权人');
    //     return;
    //   }
    // }
    if (this.isbusy) {
      this.msg.create('error', '数据正在保存，请勿重复点击');
      return;
    }
    this.isbusy = true;

    this.detailObj.bg = this.bg;


    this.detailObj.cashSalesTemplate = {};
    this.detailObj.advanceSalesTemplate = {};

    if (this.detailObj.houseType == 1) {
      this.getCashSalesTemplate();    // 现售
    }
    if (this.detailObj.houseType == 2) {
      this.getAdvanceSalesTemplate(); // 预售
    }


    const res = await this.houseTradeService.saveOrUpdateHouseTrade(
      this.detailObj
    );
    this.isbusy = false;
    if (res && res.code == 200) {
      if (!this.detailObj.id) {
        this.detailObj.id = res.msg.id;
        this.detailObj.sysDate = res.msg.sysDate;
        this.detailObj.currentStatus = res.msg.currentStatus;
      }

      if (!this.tabs.some(x => x.index == 3)) {
        this.tabs.push({ name: '关联企业', index: 3 });
      }

      this.msg.create('success', '保存成功');
    } else {
      this.msg.create('error', '保存失败');
    }
    // this.isbtShow();
  }

  // 现售合同数据填充
  getCashSalesTemplate() {

    this.detailObj.cashSalesTemplate.id = '';
    this.detailObj.cashSalesTemplate.housetradeid = '';
    this.detailObj.cashSalesTemplate.ht1 = '';
    if (!this.isEmpty(this.cashSalesTemplate.ht1)) {
      this.detailObj.cashSalesTemplate.ht1 = this.cashSalesTemplate.ht1;
    }
    this.detailObj.cashSalesTemplate.ht2 = '';
    if (!this.isEmpty(this.cashSalesTemplate.ht2)) {
      this.detailObj.cashSalesTemplate.ht2 = this.cashSalesTemplate.ht2;
    }
    this.detailObj.cashSalesTemplate.ht3 = '';
    if (!this.isEmpty(this.cashSalesTemplate.ht3)) {
      this.detailObj.cashSalesTemplate.ht3 = this.cashSalesTemplate.ht3;
    }

    this.detailObj.cashSalesTemplate.jf1 = '';
    if (!this.isEmpty(this.cashSalesTemplate.jf1)) {
      this.detailObj.cashSalesTemplate.jf1 = this.cashSalesTemplate.jf1;
    }
    this.detailObj.cashSalesTemplate.jf2 = '';
    if (!this.isEmpty(this.cashSalesTemplate.jf2)) {
      this.detailObj.cashSalesTemplate.jf2 = this.cashSalesTemplate.jf2;
    }
    this.detailObj.cashSalesTemplate.jf3 = '';
    if (!this.isEmpty(this.cashSalesTemplate.jf3)) {
      this.detailObj.cashSalesTemplate.jf3 = this.cashSalesTemplate.jf3;
    }
    this.detailObj.cashSalesTemplate.jf4 = '';
    if (!this.isEmpty(this.cashSalesTemplate.jf4)) {
      this.detailObj.cashSalesTemplate.jf4 = this.cashSalesTemplate.jf4;
    }
    this.detailObj.cashSalesTemplate.jf5 = '';
    if (!this.isEmpty(this.cashSalesTemplate.jf5)) {
      this.detailObj.cashSalesTemplate.jf5 = this.cashSalesTemplate.jf5;
    }
    this.detailObj.cashSalesTemplate.jf6 = '';
    if (!this.isEmpty(this.cashSalesTemplate.jf6)) {
      this.detailObj.cashSalesTemplate.jf6 = this.cashSalesTemplate.jf6;
    }
    this.detailObj.cashSalesTemplate.jf7 = '';
    if (!this.isEmpty(this.cashSalesTemplate.jf7)) {
      this.detailObj.cashSalesTemplate.jf7 = this.cashSalesTemplate.jf7;
    }
    this.detailObj.cashSalesTemplate.jf8 = '';
    if (!this.isEmpty(this.cashSalesTemplate.jf8)) {
      this.detailObj.cashSalesTemplate.jf8 = this.cashSalesTemplate.jf8;
    }
    this.detailObj.cashSalesTemplate.jf9 = '';
    if (!this.isEmpty(this.cashSalesTemplate.jf9)) {
      this.detailObj.cashSalesTemplate.jf9 = this.cashSalesTemplate.jf9;
    }
    this.detailObj.cashSalesTemplate.jf10 = '';
    if (!this.isEmpty(this.cashSalesTemplate.jf10)) {
      this.detailObj.cashSalesTemplate.jf10 = this.cashSalesTemplate.jf10;
    }
    this.detailObj.cashSalesTemplate.jf11 = '';
    if (!this.isEmpty(this.cashSalesTemplate.jf11)) {
      this.detailObj.cashSalesTemplate.jf11 = this.cashSalesTemplate.jf11;
    }
    this.detailObj.cashSalesTemplate.jf12 = '';
    if (!this.isEmpty(this.cashSalesTemplate.jf12)) {
      this.detailObj.cashSalesTemplate.jf12 = this.cashSalesTemplate.jf12;
    }
    this.detailObj.cashSalesTemplate.jf13 = '';
    if (!this.isEmpty(this.cashSalesTemplate.jf13)) {
      this.detailObj.cashSalesTemplate.jf13 = this.cashSalesTemplate.jf13;
    }
    this.detailObj.cashSalesTemplate.jf14 = '';
    if (!this.isEmpty(this.cashSalesTemplate.jf14)) {
      this.detailObj.cashSalesTemplate.jf14 = this.cashSalesTemplate.jf14;
    }
    this.detailObj.cashSalesTemplate.jf15 = '';
    if (!this.isEmpty(this.cashSalesTemplate.jf15)) {
      this.detailObj.cashSalesTemplate.jf15 = this.cashSalesTemplate.jf15;
    }
    this.detailObj.cashSalesTemplate.jf16 = '';
    if (!this.isEmpty(this.cashSalesTemplate.jf16)) {
      this.detailObj.cashSalesTemplate.jf16 = this.cashSalesTemplate.jf16;
    }

    this.detailObj.cashSalesTemplate.yf1 = '';
    if (!this.isEmpty(this.cashSalesTemplate.yf1)) {
      this.detailObj.cashSalesTemplate.yf1 = this.cashSalesTemplate.yf1;
    }
    this.detailObj.cashSalesTemplate.yf2 = '';
    if (!this.isEmpty(this.cashSalesTemplate.yf2)) {
      this.detailObj.cashSalesTemplate.yf2 = this.cashSalesTemplate.yf2;
    }
    this.detailObj.cashSalesTemplate.yf3 = '';
    if (!this.isEmpty(this.cashSalesTemplate.yf3)) {
      this.detailObj.cashSalesTemplate.yf3 = this.cashSalesTemplate.yf3;
    }
    this.detailObj.cashSalesTemplate.yf4 = '';
    if (!this.isEmpty(this.cashSalesTemplate.yf4)) {
      this.detailObj.cashSalesTemplate.yf4 = this.cashSalesTemplate.yf4;
    }
    this.detailObj.cashSalesTemplate.yf5 = '';
    if (!this.isEmpty(this.cashSalesTemplate.yf5)) {
      this.detailObj.cashSalesTemplate.yf5 = this.cashSalesTemplate.yf5;
    }

    this.detailObj.cashSalesTemplate.yf6 = this.cashSalesTemplate.yf6;

    console.log(this.cashSalesTemplate.yf6);
    this.detailObj.cashSalesTemplate.yf7 = '';
    if (!this.isEmpty(this.cashSalesTemplate.yf7)) {
      this.detailObj.cashSalesTemplate.yf7 = this.cashSalesTemplate.yf7;
    }
    this.detailObj.cashSalesTemplate.yf8 = '';
    if (!this.isEmpty(this.cashSalesTemplate.yf8)) {
      this.detailObj.cashSalesTemplate.yf8 = this.cashSalesTemplate.yf8;
    }
    this.detailObj.cashSalesTemplate.yf9 = '';
    if (!this.isEmpty(this.cashSalesTemplate.yf9)) {
      this.detailObj.cashSalesTemplate.yf9 = this.cashSalesTemplate.yf9;
    }
    this.detailObj.cashSalesTemplate.yf10 = '';
    if (!this.isEmpty(this.cashSalesTemplate.yf10)) {
      this.detailObj.cashSalesTemplate.yf10 = this.cashSalesTemplate.yf10;
    }
    this.detailObj.cashSalesTemplate.yf11 = '';
    if (!this.isEmpty(this.cashSalesTemplate.yf11)) {
      this.detailObj.cashSalesTemplate.yf11 = this.cashSalesTemplate.yf11;
    }
    this.detailObj.cashSalesTemplate.yf12 = '';
    if (!this.isEmpty(this.cashSalesTemplate.yf12)) {
      this.detailObj.cashSalesTemplate.yf12 = this.cashSalesTemplate.yf12;
    }
    this.detailObj.cashSalesTemplate.yf13 = '';
    if (!this.isEmpty(this.cashSalesTemplate.yf13)) {
      this.detailObj.cashSalesTemplate.yf13 = this.cashSalesTemplate.yf13;
    }
    this.detailObj.cashSalesTemplate.yf14 = '';
    if (!this.isEmpty(this.cashSalesTemplate.yf14)) {
      this.detailObj.cashSalesTemplate.yf14 = this.cashSalesTemplate.yf14;
    }
    // this.detailObj.cashSalesTemplate.yf15 = '';
    // if (!this.isEmpty(this.cashSalesTemplate.yf15)) {
    this.detailObj.cashSalesTemplate.yf15 = this.cashSalesTemplate.yf15;
    // }
    this.detailObj.cashSalesTemplate.yf16 = '';
    if (!this.isEmpty(this.cashSalesTemplate.yf16)) {
      this.detailObj.cashSalesTemplate.yf16 = this.cashSalesTemplate.yf16;
    }
    this.detailObj.cashSalesTemplate.yf17 = '';
    if (!this.isEmpty(this.cashSalesTemplate.yf17)) {
      this.detailObj.cashSalesTemplate.yf17 = this.cashSalesTemplate.yf17;
    }
    this.detailObj.cashSalesTemplate.yf18 = '';
    if (!this.isEmpty(this.cashSalesTemplate.yf18)) {
      this.detailObj.cashSalesTemplate.yf18 = this.cashSalesTemplate.yf18;
    }
    this.detailObj.cashSalesTemplate.yf19 = '';
    if (!this.isEmpty(this.cashSalesTemplate.yf19)) {
      this.detailObj.cashSalesTemplate.yf19 = this.cashSalesTemplate.yf19;
    }

    // 第一条
    this.detailObj.cashSalesTemplate.d1t1 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d1t1)) {
      this.detailObj.cashSalesTemplate.d1t1 = this.cashSalesTemplate.d1t1;
    }
    this.detailObj.cashSalesTemplate.d1t2 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d1t2)) {
      this.detailObj.cashSalesTemplate.d1t2 = this.cashSalesTemplate.d1t2;
    }
    this.detailObj.cashSalesTemplate.d1t3 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d1t3)) {
      this.detailObj.cashSalesTemplate.d1t3 = this.cashSalesTemplate.d1t3;
    }
    this.detailObj.cashSalesTemplate.d1t4 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d1t4)) {
      this.detailObj.cashSalesTemplate.d1t4 = this.cashSalesTemplate.d1t4;
    }
    this.detailObj.cashSalesTemplate.d1t5 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d1t5)) {
      this.detailObj.cashSalesTemplate.d1t5 = this.cashSalesTemplate.d1t5;
    }
    this.detailObj.cashSalesTemplate.d1t6 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d1t6)) {
      this.detailObj.cashSalesTemplate.d1t6 = this.cashSalesTemplate.d1t6;
    }
    // this.detailObj.cashSalesTemplate.d1t7 = '';
    // if (!this.isEmpty(this.cashSalesTemplate.d1t7)) {
    this.detailObj.cashSalesTemplate.d1t7 = this.cashSalesTemplate.d1t7;
    // }
    this.detailObj.cashSalesTemplate.d1t8 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d1t8)) {
      this.detailObj.cashSalesTemplate.d1t8 = this.cashSalesTemplate.d1t8;
    }
    this.detailObj.cashSalesTemplate.d1t9 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d1t9)) {
      this.detailObj.cashSalesTemplate.d1t9 = this.cashSalesTemplate.d1t9;
    }
    this.detailObj.cashSalesTemplate.d1t10 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d1t10)) {
      this.detailObj.cashSalesTemplate.d1t10 = this.cashSalesTemplate.d1t10;
    }

    // 第二条
    this.detailObj.cashSalesTemplate.d2t1 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d2t1)) {
      this.detailObj.cashSalesTemplate.d2t1 = this.cashSalesTemplate.d2t1;
    }
    this.detailObj.cashSalesTemplate.d2t2 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d2t2)) {
      this.detailObj.cashSalesTemplate.d2t2 = this.cashSalesTemplate.d2t2;
    }

    // 第三条
    this.detailObj.cashSalesTemplate.d3t1 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d3t1)) {
      this.detailObj.cashSalesTemplate.d3t1 = this.cashSalesTemplate.d3t1;
    }
    this.detailObj.cashSalesTemplate.d3t2 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d3t2)) {
      this.detailObj.cashSalesTemplate.d3t2 = this.cashSalesTemplate.d3t2;
    }
    this.detailObj.cashSalesTemplate.d3t3 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d3t3)) {
      this.detailObj.cashSalesTemplate.d3t3 = this.cashSalesTemplate.d3t3;
    }
    this.detailObj.cashSalesTemplate.d3t4 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d3t4)) {
      this.detailObj.cashSalesTemplate.d3t4 = this.cashSalesTemplate.d3t4;
    }
    this.detailObj.cashSalesTemplate.d3t5 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d3t5)) {
      this.detailObj.cashSalesTemplate.d3t5 = this.cashSalesTemplate.d3t5;
    }
    this.detailObj.cashSalesTemplate.d3t6 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d3t6)) {
      this.detailObj.cashSalesTemplate.d3t6 = this.cashSalesTemplate.d3t6;
    }
    this.detailObj.cashSalesTemplate.d3t7 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d3t7)) {
      this.detailObj.cashSalesTemplate.d3t7 = this.cashSalesTemplate.d3t7;
    }
    this.detailObj.cashSalesTemplate.d3t8 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d3t8)) {
      this.detailObj.cashSalesTemplate.d3t8 = this.cashSalesTemplate.d3t8;
    }
    this.detailObj.cashSalesTemplate.d3t9 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d3t9)) {
      this.detailObj.cashSalesTemplate.d3t9 = this.cashSalesTemplate.d3t9;
    }
    this.detailObj.cashSalesTemplate.d3t10 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d3t10)) {
      this.detailObj.cashSalesTemplate.d3t10 = this.cashSalesTemplate.d3t10;
    }
    this.detailObj.cashSalesTemplate.d3t11 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d3t11)) {
      this.detailObj.cashSalesTemplate.d3t11 = this.cashSalesTemplate.d3t11;
    }
    this.detailObj.cashSalesTemplate.d3t12 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d3t12)) {
      this.detailObj.cashSalesTemplate.d3t12 = this.cashSalesTemplate.d3t12;
    }
    this.detailObj.cashSalesTemplate.d3t13 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d3t13)) {
      this.detailObj.cashSalesTemplate.d3t13 = this.cashSalesTemplate.d3t13;
    }
    this.detailObj.cashSalesTemplate.d3t14 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d3t14)) {
      this.detailObj.cashSalesTemplate.d3t14 = this.cashSalesTemplate.d3t14;
    }
    this.detailObj.cashSalesTemplate.d3t15 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d3t15)) {
      this.detailObj.cashSalesTemplate.d3t15 = this.cashSalesTemplate.d3t15;
    }
    this.detailObj.cashSalesTemplate.d3t16 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d3t16)) {
      this.detailObj.cashSalesTemplate.d3t16 = this.cashSalesTemplate.d3t16;
    }
    this.detailObj.cashSalesTemplate.d3t17 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d3t17)) {
      this.detailObj.cashSalesTemplate.d3t17 = this.cashSalesTemplate.d3t17;
    }
    this.detailObj.cashSalesTemplate.d3t18 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d3t18)) {
      this.detailObj.cashSalesTemplate.d3t18 = this.cashSalesTemplate.d3t18;
    }

    // 第四条
    this.detailObj.cashSalesTemplate.d4t1 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d4t1)) {
      this.detailObj.cashSalesTemplate.d4t1 = this.cashSalesTemplate.d4t1;
    }
    this.detailObj.cashSalesTemplate.d4t2 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d4t2)) {
      this.detailObj.cashSalesTemplate.d4t2 = this.cashSalesTemplate.d4t2;
    }
    this.detailObj.cashSalesTemplate.d4t3 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d4t3)) {
      this.detailObj.cashSalesTemplate.d4t3 = this.cashSalesTemplate.d4t3;
    }
    // this.detailObj.cashSalesTemplate.d4t4 = '';
    // if (!this.isEmpty(this.cashSalesTemplate.d4t4)) {
    this.detailObj.cashSalesTemplate.d4t4 = this.cashSalesTemplate.d4t4;
    // }

    // 第五条
    // this.detailObj.cashSalesTemplate.d5t1 = '';
    // if (!this.isEmpty(this.cashSalesTemplate.d5t1)) {
    this.detailObj.cashSalesTemplate.d5t1 = this.cashSalesTemplate.d5t1;
    // }
    // this.detailObj.cashSalesTemplate.d5t2 = '';
    // if (!this.isEmpty(this.cashSalesTemplate.d5t2)) {
    this.detailObj.cashSalesTemplate.d5t2 = this.cashSalesTemplate.d5t2;
    // }
    this.detailObj.cashSalesTemplate.d5t3 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d5t3)) {
      this.detailObj.cashSalesTemplate.d5t3 = this.cashSalesTemplate.d5t3;
    }

    // 第六条
    this.detailObj.cashSalesTemplate.d6t1 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d6t1)) {
      this.detailObj.cashSalesTemplate.d6t1 = this.cashSalesTemplate.d6t1;
    }
    this.detailObj.cashSalesTemplate.d6t2 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d6t2)) {
      this.detailObj.cashSalesTemplate.d6t2 = this.cashSalesTemplate.d6t2;
    }
    this.detailObj.cashSalesTemplate.d6t3 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d6t3)) {
      this.detailObj.cashSalesTemplate.d6t3 = this.cashSalesTemplate.d6t3;
    }

    // 第七条
    this.detailObj.cashSalesTemplate.d7t1 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d7t1)) {
      this.detailObj.cashSalesTemplate.d7t1 = this.cashSalesTemplate.d7t1;
    }
    this.detailObj.cashSalesTemplate.d7t2 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d7t2)) {
      this.detailObj.cashSalesTemplate.d7t2 = this.cashSalesTemplate.d7t2;
    }
    this.detailObj.cashSalesTemplate.d7t3 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d7t3)) {
      this.detailObj.cashSalesTemplate.d7t3 = this.cashSalesTemplate.d7t3;
    }
    this.detailObj.cashSalesTemplate.d7t4 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d7t4)) {
      this.detailObj.cashSalesTemplate.d7t4 = this.cashSalesTemplate.d7t4;
    }
    this.detailObj.cashSalesTemplate.d7t5 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d7t5)) {
      this.detailObj.cashSalesTemplate.d7t5 = this.cashSalesTemplate.d7t5;
    }
    this.detailObj.cashSalesTemplate.d7t6 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d7t6)) {
      this.detailObj.cashSalesTemplate.d7t6 = this.cashSalesTemplate.d7t6;
    }
    this.detailObj.cashSalesTemplate.d7t7 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d7t7)) {
      this.detailObj.cashSalesTemplate.d7t7 = this.cashSalesTemplate.d7t7;
    }
    this.detailObj.cashSalesTemplate.d7t8 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d7t8)) {
      this.detailObj.cashSalesTemplate.d7t8 = this.cashSalesTemplate.d7t8;
    }
    this.detailObj.cashSalesTemplate.d7t9 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d7t9)) {
      this.detailObj.cashSalesTemplate.d7t9 = this.cashSalesTemplate.d7t9;
    }
    this.detailObj.cashSalesTemplate.d7t10 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d7t10)) {
      this.detailObj.cashSalesTemplate.d7t10 = this.cashSalesTemplate.d7t10;
    }
    this.detailObj.cashSalesTemplate.d7t11 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d7t11)) {
      this.detailObj.cashSalesTemplate.d7t11 = this.cashSalesTemplate.d7t11;
    }
    this.detailObj.cashSalesTemplate.d7t12 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d7t12)) {
      this.detailObj.cashSalesTemplate.d7t12 = this.cashSalesTemplate.d7t12;
    }
    this.detailObj.cashSalesTemplate.d7t13 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d7t13)) {
      this.detailObj.cashSalesTemplate.d7t13 = this.cashSalesTemplate.d7t13;
    }
    this.detailObj.cashSalesTemplate.d7t14 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d7t14)) {
      this.detailObj.cashSalesTemplate.d7t14 = this.cashSalesTemplate.d7t14;
    }
    this.detailObj.cashSalesTemplate.d7t15 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d7t15)) {
      this.detailObj.cashSalesTemplate.d7t15 = this.cashSalesTemplate.d7t15;
    }
    this.detailObj.cashSalesTemplate.d7t16 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d7t16)) {
      this.detailObj.cashSalesTemplate.d7t16 = this.cashSalesTemplate.d7t16;
    }
    this.detailObj.cashSalesTemplate.d7t17 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d7t17)) {
      this.detailObj.cashSalesTemplate.d7t17 = this.cashSalesTemplate.d7t17;
    }
    this.detailObj.cashSalesTemplate.d7t18 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d7t18)) {
      this.detailObj.cashSalesTemplate.d7t18 = this.cashSalesTemplate.d7t18;
    }

    // 第八条
    this.detailObj.cashSalesTemplate.d8t1 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d8t1)) {
      this.detailObj.cashSalesTemplate.d8t1 = this.cashSalesTemplate.d8t1;
    }
    this.detailObj.cashSalesTemplate.d8t2 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d8t2)) {
      this.detailObj.cashSalesTemplate.d8t2 = this.cashSalesTemplate.d8t2;
    }
    this.detailObj.cashSalesTemplate.d8t3 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d8t3)) {
      this.detailObj.cashSalesTemplate.d8t3 = this.cashSalesTemplate.d8t3;
    }
    this.detailObj.cashSalesTemplate.d8t4 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d8t4)) {
      this.detailObj.cashSalesTemplate.d8t4 = this.cashSalesTemplate.d8t4;
    }
    this.detailObj.cashSalesTemplate.d8t5 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d8t5)) {
      this.detailObj.cashSalesTemplate.d8t5 = this.cashSalesTemplate.d8t5;
    }
    // this.detailObj.cashSalesTemplate.d8t6 = '';
    // if (!this.isEmpty(this.cashSalesTemplate.d8t6)) {
    this.detailObj.cashSalesTemplate.d8t6 = this.cashSalesTemplate.d8t6;
    // }
    // this.detailObj.cashSalesTemplate.d8t7 = '';
    // if (!this.isEmpty(this.cashSalesTemplate.d8t7)) {
    this.detailObj.cashSalesTemplate.d8t7 = this.cashSalesTemplate.d8t7;
    // }
    this.detailObj.cashSalesTemplate.d8t8 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d8t8)) {
      this.detailObj.cashSalesTemplate.d8t8 = this.cashSalesTemplate.d8t8;
    }
    this.detailObj.cashSalesTemplate.d8t9 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d8t9)) {
      this.detailObj.cashSalesTemplate.d8t9 = this.cashSalesTemplate.d8t9;
    }
    this.detailObj.cashSalesTemplate.d8t10 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d8t10)) {
      this.detailObj.cashSalesTemplate.d8t10 = this.cashSalesTemplate.d8t10;
    }
    this.detailObj.cashSalesTemplate.d8t11 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d8t11)) {
      this.detailObj.cashSalesTemplate.d8t11 = this.cashSalesTemplate.d8t11;
    }
    // this.detailObj.cashSalesTemplate.d8t12 = '';
    // if (!this.isEmpty(this.cashSalesTemplate.d8t12)) {
    this.detailObj.cashSalesTemplate.d8t12 = this.cashSalesTemplate.d8t12;
    // }
    this.detailObj.cashSalesTemplate.d8t13 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d8t13)) {
      this.detailObj.cashSalesTemplate.d8t13 = this.cashSalesTemplate.d8t13;
    }
    this.detailObj.cashSalesTemplate.d8t14 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d8t14)) {
      this.detailObj.cashSalesTemplate.d8t14 = this.cashSalesTemplate.d8t14;
    }
    // this.detailObj.cashSalesTemplate.d8t15 = '';
    // if (!this.isEmpty(this.cashSalesTemplate.d8t15)) {
    this.detailObj.cashSalesTemplate.d8t15 = this.cashSalesTemplate.d8t15;
    // }
    this.detailObj.cashSalesTemplate.d8t16 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d8t16)) {
      this.detailObj.cashSalesTemplate.d8t16 = this.cashSalesTemplate.d8t16;
    }
    this.detailObj.cashSalesTemplate.d8t17 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d8t17)) {
      this.detailObj.cashSalesTemplate.d8t17 = this.cashSalesTemplate.d8t17;
    }
    this.detailObj.cashSalesTemplate.d8t18 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d8t18)) {
      this.detailObj.cashSalesTemplate.d8t18 = this.cashSalesTemplate.d8t18;
    }
    this.detailObj.cashSalesTemplate.d8t19 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d8t19)) {
      this.detailObj.cashSalesTemplate.d8t19 = this.cashSalesTemplate.d8t19;
    }
    this.detailObj.cashSalesTemplate.d8t20 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d8t20)) {
      this.detailObj.cashSalesTemplate.d8t20 = this.cashSalesTemplate.d8t20;
    }
    this.detailObj.cashSalesTemplate.d8t21 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d8t21)) {
      this.detailObj.cashSalesTemplate.d8t21 = this.cashSalesTemplate.d8t21;
    }
    this.detailObj.cashSalesTemplate.d8t22 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d8t22)) {
      this.detailObj.cashSalesTemplate.d8t22 = this.cashSalesTemplate.d8t22;
    }
    this.detailObj.cashSalesTemplate.d8t23 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d8t23)) {
      this.detailObj.cashSalesTemplate.d8t23 = this.cashSalesTemplate.d8t23;
    }
    this.detailObj.cashSalesTemplate.d8t24 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d8t24)) {
      this.detailObj.cashSalesTemplate.d8t24 = this.cashSalesTemplate.d8t24;
    }
    this.detailObj.cashSalesTemplate.d8t25 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d8t25)) {
      this.detailObj.cashSalesTemplate.d8t25 = this.cashSalesTemplate.d8t25;
    }
    this.detailObj.cashSalesTemplate.d8t26 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d8t26)) {
      this.detailObj.cashSalesTemplate.d8t26 = this.cashSalesTemplate.d8t26;
    }
    this.detailObj.cashSalesTemplate.d8t27 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d8t27)) {
      this.detailObj.cashSalesTemplate.d8t27 = this.cashSalesTemplate.d8t27;
    }

    // 第九条
    this.detailObj.cashSalesTemplate.d9t1 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d9t1)) {
      this.detailObj.cashSalesTemplate.d9t1 = this.cashSalesTemplate.d9t1;
    }
    this.detailObj.cashSalesTemplate.d9t2 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d9t2)) {
      this.detailObj.cashSalesTemplate.d9t2 = this.cashSalesTemplate.d9t2;
    }
    this.detailObj.cashSalesTemplate.d9t3 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d9t3)) {
      this.detailObj.cashSalesTemplate.d9t3 = this.cashSalesTemplate.d9t3;
    }
    this.detailObj.cashSalesTemplate.d9t4 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d9t4)) {
      this.detailObj.cashSalesTemplate.d9t4 = this.cashSalesTemplate.d9t4;
    }
    this.detailObj.cashSalesTemplate.d9t5 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d9t5)) {
      this.detailObj.cashSalesTemplate.d9t5 = this.cashSalesTemplate.d9t5;
    }
    this.detailObj.cashSalesTemplate.d9t6 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d9t6)) {
      this.detailObj.cashSalesTemplate.d9t6 = this.cashSalesTemplate.d9t6;
    }
    this.detailObj.cashSalesTemplate.d9t7 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d9t7)) {
      this.detailObj.cashSalesTemplate.d9t7 = this.cashSalesTemplate.d9t7;
    }
    this.detailObj.cashSalesTemplate.d9t8 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d9t8)) {
      this.detailObj.cashSalesTemplate.d9t8 = this.cashSalesTemplate.d9t8;
    }

    // 第十条
    this.detailObj.cashSalesTemplate.d10t1 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d10t1)) {
      this.detailObj.cashSalesTemplate.d10t1 = this.cashSalesTemplate.d10t1;
    }
    this.detailObj.cashSalesTemplate.d10t2 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d10t2)) {
      this.detailObj.cashSalesTemplate.d10t2 = this.cashSalesTemplate.d10t2;
    }
    this.detailObj.cashSalesTemplate.d10t3 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d10t3)) {
      this.detailObj.cashSalesTemplate.d10t3 = this.cashSalesTemplate.d10t3;
    }
    this.detailObj.cashSalesTemplate.d10t4 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d10t4)) {
      this.detailObj.cashSalesTemplate.d10t4 = this.cashSalesTemplate.d10t4;
    }

    // 第十一条
    this.detailObj.cashSalesTemplate.d11t1 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d11t1)) {
      this.detailObj.cashSalesTemplate.d11t1 = this.cashSalesTemplate.d11t1;
    }
    this.detailObj.cashSalesTemplate.d11t2 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d11t2)) {
      this.detailObj.cashSalesTemplate.d11t2 = this.cashSalesTemplate.d11t2;
    }
    this.detailObj.cashSalesTemplate.d11t3 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d11t3)) {
      this.detailObj.cashSalesTemplate.d11t3 = this.cashSalesTemplate.d11t3;
    }
    this.detailObj.cashSalesTemplate.d11t4 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d11t4)) {
      this.detailObj.cashSalesTemplate.d11t4 = this.cashSalesTemplate.d11t4;
    }
    this.detailObj.cashSalesTemplate.d11t5 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d11t5)) {
      this.detailObj.cashSalesTemplate.d11t5 = this.cashSalesTemplate.d11t5;
    }
    this.detailObj.cashSalesTemplate.d11t6 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d11t6)) {
      this.detailObj.cashSalesTemplate.d11t6 = this.cashSalesTemplate.d11t6;
    }
    this.detailObj.cashSalesTemplate.d11t7 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d11t7)) {
      this.detailObj.cashSalesTemplate.d11t7 = this.cashSalesTemplate.d11t7;
    }
    this.detailObj.cashSalesTemplate.d11t8 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d11t8)) {
      this.detailObj.cashSalesTemplate.d11t8 = this.cashSalesTemplate.d11t8;
    }
    this.detailObj.cashSalesTemplate.d11t9 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d11t9)) {
      this.detailObj.cashSalesTemplate.d11t9 = this.cashSalesTemplate.d11t9;
    }
    this.detailObj.cashSalesTemplate.d11t10 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d11t10)) {
      this.detailObj.cashSalesTemplate.d11t10 = this.cashSalesTemplate.d11t10;
    }
    // this.detailObj.cashSalesTemplate.d11t11 = '';
    // if (!this.isEmpty(this.cashSalesTemplate.d11t11)) {
    this.detailObj.cashSalesTemplate.d11t11 = this.cashSalesTemplate.d11t11;
    // }
    this.detailObj.cashSalesTemplate.d11t12 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d11t12)) {
      this.detailObj.cashSalesTemplate.d11t12 = this.cashSalesTemplate.d11t12;
    }
    // this.detailObj.cashSalesTemplate.d11t13 = '';
    // if (!this.isEmpty(this.cashSalesTemplate.d11t13)) {
    this.detailObj.cashSalesTemplate.d11t13 = this.cashSalesTemplate.d11t13;
    // }
    this.detailObj.cashSalesTemplate.d11t14 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d11t14)) {
      this.detailObj.cashSalesTemplate.d11t14 = this.cashSalesTemplate.d11t14;
    }
    // this.detailObj.cashSalesTemplate.d11t15 = '';
    // if (!this.isEmpty(this.cashSalesTemplate.d11t15)) {
    this.detailObj.cashSalesTemplate.d11t15 = this.cashSalesTemplate.d11t15;
    // }
    this.detailObj.cashSalesTemplate.d11t16 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d11t16)) {
      this.detailObj.cashSalesTemplate.d11t16 = this.cashSalesTemplate.d11t16;
    }
    // this.detailObj.cashSalesTemplate.d11t17 = '';
    // if (!this.isEmpty(this.cashSalesTemplate.d11t17)) {
    this.detailObj.cashSalesTemplate.d11t17 = this.cashSalesTemplate.d11t17;
    // }
    this.detailObj.cashSalesTemplate.d11t18 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d11t18)) {
      this.detailObj.cashSalesTemplate.d11t18 = this.cashSalesTemplate.d11t18;
    }
    // this.detailObj.cashSalesTemplate.d11t19 = '';
    // if (!this.isEmpty(this.cashSalesTemplate.d11t19)) {
    this.detailObj.cashSalesTemplate.d11t19 = this.cashSalesTemplate.d11t19;
    // }
    this.detailObj.cashSalesTemplate.d11t20 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d11t20)) {
      this.detailObj.cashSalesTemplate.d11t20 = this.cashSalesTemplate.d11t20;
    }
    // this.detailObj.cashSalesTemplate.d11t21 = '';
    // if (!this.isEmpty(this.cashSalesTemplate.d11t21)) {
    this.detailObj.cashSalesTemplate.d11t21 = this.cashSalesTemplate.d11t21;
    // }
    this.detailObj.cashSalesTemplate.d11t22 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d11t22)) {
      this.detailObj.cashSalesTemplate.d11t22 = this.cashSalesTemplate.d11t22;
    }
    // this.detailObj.cashSalesTemplate.d11t23 = '';
    // if (!this.isEmpty(this.cashSalesTemplate.d11t23)) {
    this.detailObj.cashSalesTemplate.d11t23 = this.cashSalesTemplate.d11t23;
    // }
    this.detailObj.cashSalesTemplate.d11t24 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d11t24)) {
      this.detailObj.cashSalesTemplate.d11t24 = this.cashSalesTemplate.d11t24;
    }
    this.detailObj.cashSalesTemplate.d11t25 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d11t25)) {
      this.detailObj.cashSalesTemplate.d11t25 = this.cashSalesTemplate.d11t25;
    }
    this.detailObj.cashSalesTemplate.d11t26 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d11t26)) {
      this.detailObj.cashSalesTemplate.d11t26 = this.cashSalesTemplate.d11t26;
    }
    this.detailObj.cashSalesTemplate.d11t27 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d11t27)) {
      this.detailObj.cashSalesTemplate.d11t27 = this.cashSalesTemplate.d11t27;
    }
    this.detailObj.cashSalesTemplate.d11t28 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d11t28)) {
      this.detailObj.cashSalesTemplate.d11t18 = this.cashSalesTemplate.d11t28;
    }
    this.detailObj.cashSalesTemplate.d11t29 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d11t29)) {
      this.detailObj.cashSalesTemplate.d11t29 = this.cashSalesTemplate.d11t29;
    }
    this.detailObj.cashSalesTemplate.d11t30 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d11t30)) {
      this.detailObj.cashSalesTemplate.d11t30 = this.cashSalesTemplate.d11t30;
    }
    this.detailObj.cashSalesTemplate.d11t31 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d11t31)) {
      this.detailObj.cashSalesTemplate.d11t31 = this.cashSalesTemplate.d11t31;
    }

    // 第十二条
    this.detailObj.cashSalesTemplate.d12t1 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d12t1)) {
      this.detailObj.cashSalesTemplate.d12t1 = this.cashSalesTemplate.d12t1;
    }
    this.detailObj.cashSalesTemplate.d12t2 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d12t2)) {
      this.detailObj.cashSalesTemplate.d12t2 = this.cashSalesTemplate.d12t2;
    }
    this.detailObj.cashSalesTemplate.d12t3 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d12t3)) {
      this.detailObj.cashSalesTemplate.d12t3 = this.cashSalesTemplate.d12t3;
    }
    this.detailObj.cashSalesTemplate.d12t4 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d12t4)) {
      this.detailObj.cashSalesTemplate.d12t4 = this.cashSalesTemplate.d12t4;
    }
    this.detailObj.cashSalesTemplate.d12t5 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d12t5)) {
      this.detailObj.cashSalesTemplate.d12t5 = this.cashSalesTemplate.d12t5;
    }
    this.detailObj.cashSalesTemplate.d12t6 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d12t6)) {
      this.detailObj.cashSalesTemplate.d12t6 = this.cashSalesTemplate.d12t6;
    }
    this.detailObj.cashSalesTemplate.d12t7 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d12t7)) {
      this.detailObj.cashSalesTemplate.d12t7 = this.cashSalesTemplate.d12t7;
    }
    this.detailObj.cashSalesTemplate.d12t8 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d12t8)) {
      this.detailObj.cashSalesTemplate.d12t8 = this.cashSalesTemplate.d12t8;
    }

    // 第十三条
    this.detailObj.cashSalesTemplate.d13t1 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d13t1)) {
      this.detailObj.cashSalesTemplate.d13t1 = this.cashSalesTemplate.d13t1;
    }
    this.detailObj.cashSalesTemplate.d13t2 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d13t2)) {
      this.detailObj.cashSalesTemplate.d13t2 = this.cashSalesTemplate.d13t2;
    }
    this.detailObj.cashSalesTemplate.d13t3 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d13t3)) {
      this.detailObj.cashSalesTemplate.d13t3 = this.cashSalesTemplate.d13t3;
    }
    this.detailObj.cashSalesTemplate.d13t4 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d13t4)) {
      this.detailObj.cashSalesTemplate.d13t4 = this.cashSalesTemplate.d13t4;
    }
    this.detailObj.cashSalesTemplate.d13t5 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d13t5)) {
      this.detailObj.cashSalesTemplate.d13t5 = this.cashSalesTemplate.d13t5;
    }
    this.detailObj.cashSalesTemplate.d13t6 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d13t6)) {
      this.detailObj.cashSalesTemplate.d13t6 = this.cashSalesTemplate.d13t6;
    }
    this.detailObj.cashSalesTemplate.d13t7 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d13t7)) {
      this.detailObj.cashSalesTemplate.d13t7 = this.cashSalesTemplate.d13t7;
    }
    this.detailObj.cashSalesTemplate.d13t8 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d13t8)) {
      this.detailObj.cashSalesTemplate.d13t8 = this.cashSalesTemplate.d13t8;
    }


    // 第十四条
    this.detailObj.cashSalesTemplate.d14t1 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d14t1)) {
      this.detailObj.cashSalesTemplate.d14t1 = this.cashSalesTemplate.d14t1;
    }
    this.detailObj.cashSalesTemplate.d14t2 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d14t2)) {
      this.detailObj.cashSalesTemplate.d14t2 = this.cashSalesTemplate.d14t2;
    }
    this.detailObj.cashSalesTemplate.d14t3 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d14t3)) {
      this.detailObj.cashSalesTemplate.d14t3 = this.cashSalesTemplate.d14t3;
    }
    this.detailObj.cashSalesTemplate.d14t4 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d14t4)) {
      this.detailObj.cashSalesTemplate.d14t4 = this.cashSalesTemplate.d14t4;
    }
    this.detailObj.cashSalesTemplate.d14t5 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d14t5)) {
      this.detailObj.cashSalesTemplate.d14t5 = this.cashSalesTemplate.d14t5;
    }
    this.detailObj.cashSalesTemplate.d14t6 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d14t6)) {
      this.detailObj.cashSalesTemplate.d14t6 = this.cashSalesTemplate.d14t6;
    }
    this.detailObj.cashSalesTemplate.d14t7 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d14t7)) {
      this.detailObj.cashSalesTemplate.d14t7 = this.cashSalesTemplate.d14t7;
    }
    this.detailObj.cashSalesTemplate.d14t8 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d14t8)) {
      this.detailObj.cashSalesTemplate.d14t8 = this.cashSalesTemplate.d14t8;
    }
    this.detailObj.cashSalesTemplate.d14t9 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d14t9)) {
      this.detailObj.cashSalesTemplate.d14t9 = this.cashSalesTemplate.d14t9;
    }
    this.detailObj.cashSalesTemplate.d14t10 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d14t10)) {
      this.detailObj.cashSalesTemplate.d14t10 = this.cashSalesTemplate.d14t10;
    }
    this.detailObj.cashSalesTemplate.d14t11 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d14t11)) {
      this.detailObj.cashSalesTemplate.d14t11 = this.cashSalesTemplate.d14t11;
    }
    this.detailObj.cashSalesTemplate.d14t12 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d14t12)) {
      this.detailObj.cashSalesTemplate.d14t12 = this.cashSalesTemplate.d14t12;
    }
    this.detailObj.cashSalesTemplate.d14t13 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d14t13)) {
      this.detailObj.cashSalesTemplate.d14t13 = this.cashSalesTemplate.d14t13;
    }
    this.detailObj.cashSalesTemplate.d14t14 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d14t14)) {
      this.detailObj.cashSalesTemplate.d14t14 = this.cashSalesTemplate.d14t14;
    }
    this.detailObj.cashSalesTemplate.d14t15 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d14t15)) {
      this.detailObj.cashSalesTemplate.d14t15 = this.cashSalesTemplate.d14t15;
    }

    // 第15条
    this.detailObj.cashSalesTemplate.d15t1 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d15t1)) {
      this.detailObj.cashSalesTemplate.d15t1 = this.cashSalesTemplate.d15t1;
    }
    this.detailObj.cashSalesTemplate.d15t2 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d15t2)) {
      this.detailObj.cashSalesTemplate.d15t2 = this.cashSalesTemplate.d15t2;
    }


    // 第16条
    this.detailObj.cashSalesTemplate.d16t1 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d16t1)) {
      this.detailObj.cashSalesTemplate.d16t1 = this.cashSalesTemplate.d16t1;
    }


    // 第17条
    this.detailObj.cashSalesTemplate.d17t1 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d17t1)) {
      this.detailObj.cashSalesTemplate.d17t1 = this.cashSalesTemplate.d17t1;
    }
    this.detailObj.cashSalesTemplate.d17t2 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d17t2)) {
      this.detailObj.cashSalesTemplate.d17t2 = this.cashSalesTemplate.d17t2;
    }
    this.detailObj.cashSalesTemplate.d17t3 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d17t3)) {
      this.detailObj.cashSalesTemplate.d17t3 = this.cashSalesTemplate.d17t3;
    }
    this.detailObj.cashSalesTemplate.d17t4 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d17t4)) {
      this.detailObj.cashSalesTemplate.d17t4 = this.cashSalesTemplate.d17t4;
    }
    this.detailObj.cashSalesTemplate.d17t5 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d17t5)) {
      this.detailObj.cashSalesTemplate.d17t5 = this.cashSalesTemplate.d17t5;
    }

    // 第18条
    this.detailObj.cashSalesTemplate.d18t1 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d18t1)) {
      this.detailObj.cashSalesTemplate.d18t1 = this.cashSalesTemplate.d18t1;
    }
    // this.detailObj.cashSalesTemplate.d18t2 = '';
    // if (!this.isEmpty(this.cashSalesTemplate.d18t2)) {
    this.detailObj.cashSalesTemplate.d18t2 = this.cashSalesTemplate.d18t2;
    // }
    // this.detailObj.cashSalesTemplate.d18t3 = '';
    // if (!this.isEmpty(this.cashSalesTemplate.d18t3)) {
    this.detailObj.cashSalesTemplate.d18t3 = this.cashSalesTemplate.d18t3;
    // }
    this.detailObj.cashSalesTemplate.d18t4 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d18t4)) {
      this.detailObj.cashSalesTemplate.d18t4 = this.cashSalesTemplate.d18t4;
    }
    this.detailObj.cashSalesTemplate.d18t5 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d18t5)) {
      this.detailObj.cashSalesTemplate.d18t5 = this.cashSalesTemplate.d18t5;
    }

    // 第19条
    this.detailObj.cashSalesTemplate.d19t1 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d19t1)) {
      this.detailObj.cashSalesTemplate.d19t1 = this.cashSalesTemplate.d19t1;
    }
    this.detailObj.cashSalesTemplate.d19t2 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d19t2)) {
      this.detailObj.cashSalesTemplate.d19t2 = this.cashSalesTemplate.d19t2;
    }
    this.detailObj.cashSalesTemplate.d19t3 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d19t3)) {
      this.detailObj.cashSalesTemplate.d19t3 = this.cashSalesTemplate.d19t3;
    }
    this.detailObj.cashSalesTemplate.d19t4 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d19t4)) {
      this.detailObj.cashSalesTemplate.d19t4 = this.cashSalesTemplate.d19t4;
    }

    // 第21条
    this.detailObj.cashSalesTemplate.d21t1 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d21t1)) {
      this.detailObj.cashSalesTemplate.d21t1 = this.cashSalesTemplate.d21t1;
    }
    this.detailObj.cashSalesTemplate.d21t2 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d21t2)) {
      this.detailObj.cashSalesTemplate.d21t2 = this.cashSalesTemplate.d21t2;
    }

    // 第22条
    this.detailObj.cashSalesTemplate.d22t1 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d22t1)) {
      this.detailObj.cashSalesTemplate.d22t1 = this.cashSalesTemplate.d22t1;
    }
    this.detailObj.cashSalesTemplate.d22t2 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d22t2)) {
      this.detailObj.cashSalesTemplate.d22t2 = this.cashSalesTemplate.d22t2;
    }

    // 第24条
    this.detailObj.cashSalesTemplate.d24t1 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d24t1)) {
      this.detailObj.cashSalesTemplate.d24t1 = this.cashSalesTemplate.d24t1;
    }
    this.detailObj.cashSalesTemplate.d24t2 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d24t2)) {
      this.detailObj.cashSalesTemplate.d24t2 = this.cashSalesTemplate.d24t2;
    }

    // 第26条
    this.detailObj.cashSalesTemplate.d26t1 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d26t1)) {
      this.detailObj.cashSalesTemplate.d26t1 = this.cashSalesTemplate.d26t1;
    }
    this.detailObj.cashSalesTemplate.d26t2 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d26t2)) {
      this.detailObj.cashSalesTemplate.d26t2 = this.cashSalesTemplate.d26t2;
    }
    this.detailObj.cashSalesTemplate.d26t3 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d26t3)) {
      this.detailObj.cashSalesTemplate.d26t3 = this.cashSalesTemplate.d26t3;
    }
    this.detailObj.cashSalesTemplate.d26t4 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d26t4)) {
      this.detailObj.cashSalesTemplate.d26t4 = this.cashSalesTemplate.d26t4;
    }
    this.detailObj.cashSalesTemplate.d26t5 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d26t5)) {
      this.detailObj.cashSalesTemplate.d26t5 = this.cashSalesTemplate.d26t5;
    }
    this.detailObj.cashSalesTemplate.d26t6 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d26t6)) {
      this.detailObj.cashSalesTemplate.d26t6 = this.cashSalesTemplate.d26t6;
    }
    this.detailObj.cashSalesTemplate.d26t7 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d26t7)) {
      this.detailObj.cashSalesTemplate.d26t7 = this.cashSalesTemplate.d26t7;
    }
    this.detailObj.cashSalesTemplate.d26t8 = '';
    if (!this.isEmpty(this.cashSalesTemplate.d26t8)) {
      this.detailObj.cashSalesTemplate.d26t8 = this.cashSalesTemplate.d26t8;
    }


    // 合同签章
    this.detailObj.cashSalesTemplate.qz1 = '';
    if (!this.isEmpty(this.cashSalesTemplate.qz1)) {
      this.detailObj.cashSalesTemplate.qz1 = this.cashSalesTemplate.qz1;
    }
    this.detailObj.cashSalesTemplate.qz2 = '';
    if (!this.isEmpty(this.cashSalesTemplate.qz2)) {
      this.detailObj.cashSalesTemplate.qz2 = this.cashSalesTemplate.qz2;
    }
    this.detailObj.cashSalesTemplate.qz3 = '';
    if (!this.isEmpty(this.cashSalesTemplate.qz3)) {
      this.detailObj.cashSalesTemplate.qz3 = this.cashSalesTemplate.qz3;
    }
    // this.detailObj.cashSalesTemplate.qz4 = '';
    // if (!this.isEmpty(this.cashSalesTemplate.qz4)) {
    this.detailObj.cashSalesTemplate.qz4 = this.cashSalesTemplate.qz4;
    // }
    this.detailObj.cashSalesTemplate.qz5 = '';
    if (!this.isEmpty(this.cashSalesTemplate.qz5)) {
      this.detailObj.cashSalesTemplate.qz5 = this.cashSalesTemplate.qz5;
    }
    this.detailObj.cashSalesTemplate.qz6 = '';
    if (!this.isEmpty(this.cashSalesTemplate.qz6)) {
      this.detailObj.cashSalesTemplate.qz6 = this.cashSalesTemplate.qz6;
    }
    this.detailObj.cashSalesTemplate.qz7 = '';
    if (!this.isEmpty(this.cashSalesTemplate.qz7)) {
      this.detailObj.cashSalesTemplate.qz7 = this.cashSalesTemplate.qz7;
    }
    this.detailObj.cashSalesTemplate.qz8 = '';
    if (!this.isEmpty(this.cashSalesTemplate.qz8)) {
      this.detailObj.cashSalesTemplate.qz8 = this.cashSalesTemplate.qz8;
    }
    this.detailObj.cashSalesTemplate.qz9 = '';
    if (!this.isEmpty(this.cashSalesTemplate.qz9)) {
      this.detailObj.cashSalesTemplate.qz9 = this.cashSalesTemplate.qz9;
    }
    // this.detailObj.cashSalesTemplate.qz10 = '';
    // if (!this.isEmpty(this.cashSalesTemplate.qz10)) {
    this.detailObj.cashSalesTemplate.qz10 = this.cashSalesTemplate.qz10;
    // }
    this.detailObj.cashSalesTemplate.qz11 = '';
    if (!this.isEmpty(this.cashSalesTemplate.qz11)) {
      this.detailObj.cashSalesTemplate.qz11 = this.cashSalesTemplate.qz11;
    }

    // 附件七
    this.detailObj.cashSalesTemplate.fj7jw1 = '';
    if (!this.isEmpty(this.cashSalesTemplate.fj7jw1)) {
      this.detailObj.cashSalesTemplate.fj7jw1 = this.cashSalesTemplate.fj7jw1;
    }
    this.detailObj.cashSalesTemplate.fj7jw2 = '';
    if (!this.isEmpty(this.cashSalesTemplate.fj7jw2)) {
      this.detailObj.cashSalesTemplate.fj7jw2 = this.cashSalesTemplate.fj7jw2;
    }
    this.detailObj.cashSalesTemplate.fj7jw3 = '';
    if (!this.isEmpty(this.cashSalesTemplate.fj7jw3)) {
      this.detailObj.cashSalesTemplate.fj7jw3 = this.cashSalesTemplate.fj7jw3;
    }
    this.detailObj.cashSalesTemplate.fj7jw4 = '';
    if (!this.isEmpty(this.cashSalesTemplate.fj7jw4)) {
      this.detailObj.cashSalesTemplate.fj7jw4 = this.cashSalesTemplate.fj7jw4;
    }
    this.detailObj.cashSalesTemplate.fj7jw5 = '';
    if (!this.isEmpty(this.cashSalesTemplate.fj7jw5)) {
      this.detailObj.cashSalesTemplate.fj7jw5 = this.cashSalesTemplate.fj7jw5;
    }
    this.detailObj.cashSalesTemplate.fj7jw6 = '';
    if (!this.isEmpty(this.cashSalesTemplate.fj7jw6)) {
      this.detailObj.cashSalesTemplate.fj7jw6 = this.cashSalesTemplate.fj7jw6;
    }
    this.detailObj.cashSalesTemplate.fj7jw7 = '';
    if (!this.isEmpty(this.cashSalesTemplate.fj7jw7)) {
      this.detailObj.cashSalesTemplate.fj7jw7 = this.cashSalesTemplate.fj7jw7;
    }
    this.detailObj.cashSalesTemplate.fj7jw8 = '';
    if (!this.isEmpty(this.cashSalesTemplate.fj7jw8)) {
      this.detailObj.cashSalesTemplate.fj7jw8 = this.cashSalesTemplate.fj7jw8;
    }
    this.detailObj.cashSalesTemplate.fj7jw9 = '';
    if (!this.isEmpty(this.cashSalesTemplate.fj7jw9)) {
      this.detailObj.cashSalesTemplate.fj7jw9 = this.cashSalesTemplate.fj7jw9;
    }
    this.detailObj.cashSalesTemplate.fj7jw10 = '';
    if (!this.isEmpty(this.cashSalesTemplate.fj7jw10)) {
      this.detailObj.cashSalesTemplate.fj7jw10 = this.cashSalesTemplate.fj7jw10;
    }
    this.detailObj.cashSalesTemplate.fj7jw11 = '';
    if (!this.isEmpty(this.cashSalesTemplate.fj7jw11)) {
      this.detailObj.cashSalesTemplate.fj7jw11 = this.cashSalesTemplate.fj7jw11;
    }
    this.detailObj.cashSalesTemplate.fj7jw12 = '';
    if (!this.isEmpty(this.cashSalesTemplate.fj7jw12)) {
      this.detailObj.cashSalesTemplate.fj7jw12 = this.cashSalesTemplate.fj7jw12;
    }
    this.detailObj.cashSalesTemplate.fj7jw13 = '';
    if (!this.isEmpty(this.cashSalesTemplate.fj7jw13)) {
      this.detailObj.cashSalesTemplate.fj7jw13 = this.cashSalesTemplate.fj7jw13;
    }
    this.detailObj.cashSalesTemplate.fj7jw14 = '';
    if (!this.isEmpty(this.cashSalesTemplate.fj7jw14)) {
      this.detailObj.cashSalesTemplate.fj7jw14 = this.cashSalesTemplate.fj7jw14;
    }
    this.detailObj.cashSalesTemplate.fj7jw15 = '';
    if (!this.isEmpty(this.cashSalesTemplate.fj7jw15)) {
      this.detailObj.cashSalesTemplate.fj7jw15 = this.cashSalesTemplate.fj7jw15;
    }
    this.detailObj.cashSalesTemplate.fj7jw16 = '';
    if (!this.isEmpty(this.cashSalesTemplate.fj7jw16)) {
      this.detailObj.cashSalesTemplate.fj7jw16 = this.cashSalesTemplate.fj7jw16;
    }
    this.detailObj.cashSalesTemplate.fj7jw17 = '';
    if (!this.isEmpty(this.cashSalesTemplate.fj7jw17)) {
      this.detailObj.cashSalesTemplate.fj7jw17 = this.cashSalesTemplate.fj7jw17;
    }
    this.detailObj.cashSalesTemplate.fj7jw18 = '';
    if (!this.isEmpty(this.cashSalesTemplate.fj7jw18)) {
      this.detailObj.cashSalesTemplate.fj7jw18 = this.cashSalesTemplate.fj7jw18;
    }
    this.detailObj.cashSalesTemplate.fj7jw19 = '';
    if (!this.isEmpty(this.cashSalesTemplate.fj7jw19)) {
      this.detailObj.cashSalesTemplate.fj7jw19 = this.cashSalesTemplate.fj7jw19;
    }
    this.detailObj.cashSalesTemplate.fj7jw20 = '';
    if (!this.isEmpty(this.cashSalesTemplate.fj7jw20)) {
      this.detailObj.cashSalesTemplate.fj7jw20 = this.cashSalesTemplate.fj7jw20;
    }
    this.detailObj.cashSalesTemplate.fj7jw21 = '';
    if (!this.isEmpty(this.cashSalesTemplate.fj7jw21)) {
      this.detailObj.cashSalesTemplate.fj7jw21 = this.cashSalesTemplate.fj7jw21;
    }
    this.detailObj.cashSalesTemplate.fj7jw22 = '';
    if (!this.isEmpty(this.cashSalesTemplate.fj7jw22)) {
      this.detailObj.cashSalesTemplate.fj7jw22 = this.cashSalesTemplate.fj7jw22;
    }
    this.detailObj.cashSalesTemplate.fj7jw23 = '';
    if (!this.isEmpty(this.cashSalesTemplate.fj7jw23)) {
      this.detailObj.cashSalesTemplate.fj7jw23 = this.cashSalesTemplate.fj7jw23;
    }
    this.detailObj.cashSalesTemplate.fj7jw24 = '';
    if (!this.isEmpty(this.cashSalesTemplate.fj7jw24)) {
      this.detailObj.cashSalesTemplate.fj7jw24 = this.cashSalesTemplate.fj7jw24;
    }
    this.detailObj.cashSalesTemplate.fj7jw25 = '';
    if (!this.isEmpty(this.cashSalesTemplate.fj7jw25)) {
      this.detailObj.cashSalesTemplate.fj7jw25 = this.cashSalesTemplate.fj7jw25;
    }
    this.detailObj.cashSalesTemplate.fj7jw26 = '';
    if (!this.isEmpty(this.cashSalesTemplate.fj7jw26)) {
      this.detailObj.cashSalesTemplate.fj7jw26 = this.cashSalesTemplate.fj7jw26;
    }
    this.detailObj.cashSalesTemplate.fj7jw27 = '';
    if (!this.isEmpty(this.cashSalesTemplate.fj7jw27)) {
      this.detailObj.cashSalesTemplate.fj7jw27 = this.cashSalesTemplate.fj7jw27;
    }
    this.detailObj.cashSalesTemplate.fj7jw28 = '';
    if (!this.isEmpty(this.cashSalesTemplate.fj7jw28)) {
      this.detailObj.cashSalesTemplate.fj7jw18 = this.cashSalesTemplate.fj7jw28;
    }
    this.detailObj.cashSalesTemplate.fj7jw29 = '';
    if (!this.isEmpty(this.cashSalesTemplate.fj7jw29)) {
      this.detailObj.cashSalesTemplate.fj7jw29 = this.cashSalesTemplate.fj7jw29;
    }
    this.detailObj.cashSalesTemplate.fj7jw30 = '';
    if (!this.isEmpty(this.cashSalesTemplate.fj7jw30)) {
      this.detailObj.cashSalesTemplate.fj7jw30 = this.cashSalesTemplate.fj7jw30;
    }


    // 附件八
    this.detailObj.cashSalesTemplate.fj8jw1 = '';
    if (!this.isEmpty(this.cashSalesTemplate.fj8jw1)) {
      this.detailObj.cashSalesTemplate.fj8jw1 = this.cashSalesTemplate.fj8jw1;
    }
    this.detailObj.cashSalesTemplate.fj8jw2 = '';
    if (!this.isEmpty(this.cashSalesTemplate.fj8jw2)) {
      this.detailObj.cashSalesTemplate.fj8jw2 = this.cashSalesTemplate.fj8jw2;
    }
    this.detailObj.cashSalesTemplate.fj8jw3 = '';
    if (!this.isEmpty(this.cashSalesTemplate.fj8jw3)) {
      this.detailObj.cashSalesTemplate.fj8jw3 = this.cashSalesTemplate.fj8jw3;
    }
    this.detailObj.cashSalesTemplate.fj8jw4 = '';
    if (!this.isEmpty(this.cashSalesTemplate.fj8jw4)) {
      this.detailObj.cashSalesTemplate.fj8jw4 = this.cashSalesTemplate.fj8jw4;
    }
    this.detailObj.cashSalesTemplate.fj8jw5 = '';
    if (!this.isEmpty(this.cashSalesTemplate.fj8jw5)) {
      this.detailObj.cashSalesTemplate.fj8jw5 = this.cashSalesTemplate.fj8jw5;
    }
    this.detailObj.cashSalesTemplate.fj8jw6 = '';
    if (!this.isEmpty(this.cashSalesTemplate.fj8jw6)) {
      this.detailObj.cashSalesTemplate.fj8jw6 = this.cashSalesTemplate.fj8jw6;
    }
    this.detailObj.cashSalesTemplate.fj8jw7 = '';
    if (!this.isEmpty(this.cashSalesTemplate.fj8jw7)) {
      this.detailObj.cashSalesTemplate.fj8jw7 = this.cashSalesTemplate.fj8jw7;
    }
    this.detailObj.cashSalesTemplate.fj8jw8 = '';
    if (!this.isEmpty(this.cashSalesTemplate.fj8jw8)) {
      this.detailObj.cashSalesTemplate.fj8jw8 = this.cashSalesTemplate.fj8jw8;
    }
    this.detailObj.cashSalesTemplate.fj8jw9 = '';
    if (!this.isEmpty(this.cashSalesTemplate.fj8jw9)) {
      this.detailObj.cashSalesTemplate.fj8jw9 = this.cashSalesTemplate.fj8jw9;
    }
    this.detailObj.cashSalesTemplate.fj8jw10 = '';
    if (!this.isEmpty(this.cashSalesTemplate.fj8jw10)) {
      this.detailObj.cashSalesTemplate.fj8jw10 = this.cashSalesTemplate.fj8jw10;
    }
    this.detailObj.cashSalesTemplate.fj8jw11 = '';
    if (!this.isEmpty(this.cashSalesTemplate.fj8jw11)) {
      this.detailObj.cashSalesTemplate.fj8jw11 = this.cashSalesTemplate.fj8jw11;
    }
    this.detailObj.cashSalesTemplate.fj8jw12 = '';
    if (!this.isEmpty(this.cashSalesTemplate.fj8jw12)) {
      this.detailObj.cashSalesTemplate.fj8jw12 = this.cashSalesTemplate.fj8jw12;
    }
    this.detailObj.cashSalesTemplate.fj8jw13 = '';
    if (!this.isEmpty(this.cashSalesTemplate.fj8jw13)) {
      this.detailObj.cashSalesTemplate.fj8jw13 = this.cashSalesTemplate.fj8jw13;
    }
    this.detailObj.cashSalesTemplate.fj8jw14 = '';
    if (!this.isEmpty(this.cashSalesTemplate.fj8jw14)) {
      this.detailObj.cashSalesTemplate.fj8jw14 = this.cashSalesTemplate.fj8jw14;
    }

    // 现售补充20200214
    this.detailObj.cashSalesTemplate.htmc = '';
    if (!this.isEmpty(this.cashSalesTemplate.htmc)) {
      this.detailObj.cashSalesTemplate.htmc = this.cashSalesTemplate.htmc;
    }
    this.detailObj.cashSalesTemplate.fh = '';
    if (!this.isEmpty(this.cashSalesTemplate.fh)) {
      this.detailObj.cashSalesTemplate.fh = this.cashSalesTemplate.fh;
    }

    this.detailObj.cashSalesTemplate.isdbr = 0;
    if (this.cashSalesTemplate.isdbr == true) {
      this.detailObj.cashSalesTemplate.isdbr = 1;
    }
    this.detailObj.cashSalesTemplate.isfzr = 0;
    if (this.cashSalesTemplate.isfzr == true) {
      this.detailObj.cashSalesTemplate.isfzr = 1;
    }
    this.detailObj.cashSalesTemplate.isdbrgj = 0;
    if (this.cashSalesTemplate.isdbrgj == true) {
      this.detailObj.cashSalesTemplate.isdbrgj = 1;
    }
    this.detailObj.cashSalesTemplate.isdbrhj = 0;
    if (this.cashSalesTemplate.isdbrhj == true) {
      this.detailObj.cashSalesTemplate.isdbrhj = 1;
    }
    this.detailObj.cashSalesTemplate.isdbrsfz = 0;
    if (this.cashSalesTemplate.isdbrsfz == true) {
      this.detailObj.cashSalesTemplate.isdbrsfz = 1;
    }
    this.detailObj.cashSalesTemplate.isdbrhz = 0;
    if (this.cashSalesTemplate.isdbrhz == true) {
      this.detailObj.cashSalesTemplate.isdbrhz = 1;
    }
    this.detailObj.cashSalesTemplate.isdbryyzz = 0;
    if (this.cashSalesTemplate.isdbryyzz == true) {
      this.detailObj.cashSalesTemplate.isdbryyzz = 1;
    }

    this.detailObj.cashSalesTemplate.iswtdlr = 0;
    if (this.cashSalesTemplate.iswtdlr == true) {
      this.detailObj.cashSalesTemplate.iswtdlr = 1;
    }
    this.detailObj.cashSalesTemplate.isfddlr = 0;
    if (this.cashSalesTemplate.isfddlr == true) {
      this.detailObj.cashSalesTemplate.isfddlr = 1;
    }
    this.detailObj.cashSalesTemplate.isdlrgj = 0;
    if (this.cashSalesTemplate.isdlrgj == true) {
      this.detailObj.cashSalesTemplate.isdlrgj = 1;
    }
    this.detailObj.cashSalesTemplate.isdlrhj = 0;
    if (this.cashSalesTemplate.isdlrhj == true) {
      this.detailObj.cashSalesTemplate.isdlrhj = 1;
    }
    this.detailObj.cashSalesTemplate.isdlrsfz = 0;
    if (this.cashSalesTemplate.isdlrsfz == true) {
      this.detailObj.cashSalesTemplate.isdlrsfz = 1;
    }
    this.detailObj.cashSalesTemplate.isdlrhz = 0;
    if (this.cashSalesTemplate.isdlrhz == true) {
      this.detailObj.cashSalesTemplate.isdlrhz = 1;
    }
    this.detailObj.cashSalesTemplate.isdlryyzz = 0;
    if (this.cashSalesTemplate.isdlryyzz == true) {
      this.detailObj.cashSalesTemplate.isdlryyzz = 1;
    }
    // 第一条
    this.detailObj.cashSalesTemplate.iscrd1 = 0;
    if (this.cashSalesTemplate.iscrd1 == true) {
      this.detailObj.cashSalesTemplate.iscrd1 = 1;
    }
    this.detailObj.cashSalesTemplate.ishbd1 = 0;
    if (this.cashSalesTemplate.ishbd1 == true) {
      this.detailObj.cashSalesTemplate.ishbd1 = 1;
    }

    // 第二条
    this.detailObj.cashSalesTemplate.isjswjd2 = 0;
    if (this.cashSalesTemplate.isjswjd2 == true) {
      this.detailObj.cashSalesTemplate.isjswjd2 = 1;
    }
    this.detailObj.cashSalesTemplate.isbdcqzd2 = 0;
    if (this.cashSalesTemplate.isbdcqzd2 == true) {
      this.detailObj.cashSalesTemplate.isbdcqzd2 = 1;
    }
    this.detailObj.cashSalesTemplate.isbahd2 = 0;
    if (this.cashSalesTemplate.isbahd2 == true) {
      this.detailObj.cashSalesTemplate.isbahd2 = 1;
    }
    this.detailObj.cashSalesTemplate.isbdczhd2 = 0;
    if (this.cashSalesTemplate.isbdczhd2 == true) {
      this.detailObj.cashSalesTemplate.isbdczhd2 = 1;
    }
    this.detailObj.cashSalesTemplate.isbajgd2 = 0;
    if (this.cashSalesTemplate.isbajgd2 == true) {
      this.detailObj.cashSalesTemplate.isbajgd2 = 1;
    }
    this.detailObj.cashSalesTemplate.isdjjgd2 = 0;
    if (this.cashSalesTemplate.isdjjgd2 == true) {
      this.detailObj.cashSalesTemplate.isdjjgd2 = 1;
    }

    // 第3条
    this.detailObj.cashSalesTemplate.iszzd3 = 0;
    if (this.cashSalesTemplate.iszzd3 == true) {
      this.detailObj.cashSalesTemplate.iszzd3 = 1;
    }
    this.detailObj.cashSalesTemplate.isbgd3 = 0;
    if (this.cashSalesTemplate.isbgd3 == true) {
      this.detailObj.cashSalesTemplate.isbgd3 = 1;
    }
    this.detailObj.cashSalesTemplate.issyd3 = 0;
    if (this.cashSalesTemplate.issyd3 == true) {
      this.detailObj.cashSalesTemplate.issyd3 = 1;
    }
    this.detailObj.cashSalesTemplate.isz1d3 = 0;
    if (this.cashSalesTemplate.isz1d3 == true) {
      this.detailObj.cashSalesTemplate.isz1d3 = 1;
    }
    this.detailObj.cashSalesTemplate.isz2d3 = 0;
    if (this.cashSalesTemplate.isz2d3 == true) {
      this.detailObj.cashSalesTemplate.isz2d3 = 1;
    }

    // 第4条
    this.detailObj.cashSalesTemplate.isdyd4 = 0;
    if (this.cashSalesTemplate.isdyd4 == true) {
      this.detailObj.cashSalesTemplate.isdyd4 = 1;
    }
    this.detailObj.cashSalesTemplate.iswdyd4 = 0;
    if (this.cashSalesTemplate.iswdyd4 == true) {
      this.detailObj.cashSalesTemplate.iswdyd4 = 1;
    }

    // 第5条
    this.detailObj.cashSalesTemplate.isczd5 = 0;
    if (this.cashSalesTemplate.isczd5 == true) {
      this.detailObj.cashSalesTemplate.isczd5 = 1;
    }
    this.detailObj.cashSalesTemplate.iswczd5 = 0;
    if (this.cashSalesTemplate.iswczd5 == true) {
      this.detailObj.cashSalesTemplate.iswczd5 = 1;
    }
    this.detailObj.cashSalesTemplate.isczrd5 = 0;
    if (this.cashSalesTemplate.isczrd5 == true) {
      this.detailObj.cashSalesTemplate.isczrd5 = 1;
    }
    this.detailObj.cashSalesTemplate.isgmqd5 = 0;
    if (this.cashSalesTemplate.isgmqd5 == true) {
      this.detailObj.cashSalesTemplate.isgmqd5 = 1;
    }
    this.detailObj.cashSalesTemplate.iscmrd5 = 0;
    if (this.cashSalesTemplate.iscmrd5 == true) {
      this.detailObj.cashSalesTemplate.iscmrd5 = 1;
    }
    this.detailObj.cashSalesTemplate.ismsrd5 = 0;
    if (this.cashSalesTemplate.ismsrd5 == true) {
      this.detailObj.cashSalesTemplate.ismsrd5 = 1;
    }

    // 第6条
    this.detailObj.cashSalesTemplate.isyffkd6 = 0;
    if (this.cashSalesTemplate.isyffkd6 == true) {
      this.detailObj.cashSalesTemplate.isyffkd6 = 1;
    }
    this.detailObj.cashSalesTemplate.isqbssd6 = 0;
    if (this.cashSalesTemplate.isqbssd6 == true) {
      this.detailObj.cashSalesTemplate.isqbssd6 = 1;
    }

    // 第8条
    this.detailObj.cashSalesTemplate.ishtqdd8 = 0;
    if (this.cashSalesTemplate.ishtqdd8 == true) {
      this.detailObj.cashSalesTemplate.ishtqdd8 = 1;
    }
    this.detailObj.cashSalesTemplate.isjfsfkd8 = 0;
    if (this.cashSalesTemplate.isjfsfkd8 == true) {
      this.detailObj.cashSalesTemplate.isjfsfkd8 = 1;
    }
    this.detailObj.cashSalesTemplate.isdzd8 = 0;
    if (this.cashSalesTemplate.isdzd8 == true) {
      this.detailObj.cashSalesTemplate.isdzd8 = 1;
    }
    this.detailObj.cashSalesTemplate.isgjjdkd8 = 0;
    if (this.cashSalesTemplate.isgjjdkd8 == true) {
      this.detailObj.cashSalesTemplate.isgjjdkd8 = 1;
    }
    this.detailObj.cashSalesTemplate.issydkd8 = 0;
    if (this.cashSalesTemplate.issydkd8 == true) {
      this.detailObj.cashSalesTemplate.issydkd8 = 1;
    }

    // 第14条
    this.detailObj.cashSalesTemplate.isyffkd14 = 0;
    if (this.cashSalesTemplate.isyffkd14 == true) {
      this.detailObj.cashSalesTemplate.isyffkd14 = 1;
    }
    this.detailObj.cashSalesTemplate.isqbssd14 = 0;
    if (this.cashSalesTemplate.isqbssd14 == true) {
      this.detailObj.cashSalesTemplate.isqbssd14 = 1;
    }
    this.detailObj.cashSalesTemplate.isgj1d14 = 0;
    if (this.cashSalesTemplate.isgj1d14 == true) {
      this.detailObj.cashSalesTemplate.isgj1d14 = 1;
    }
    this.detailObj.cashSalesTemplate.isdf1d14 = 0;
    if (this.cashSalesTemplate.isdf1d14 == true) {
      this.detailObj.cashSalesTemplate.isdf1d14 = 1;
    }
    this.detailObj.cashSalesTemplate.isgj2d14 = 0;
    if (this.cashSalesTemplate.isgj2d14 == true) {
      this.detailObj.cashSalesTemplate.isgj2d14 = 1;
    }
    this.detailObj.cashSalesTemplate.isdf2d14 = 0;
    if (this.cashSalesTemplate.isdf2d14 == true) {
      this.detailObj.cashSalesTemplate.isdf2d14 = 1;
    }

    // 第18条
    this.detailObj.cashSalesTemplate.isbgzd18 = 0;
    if (this.cashSalesTemplate.isbgzd18 == true) {
      this.detailObj.cashSalesTemplate.isbgzd18 = 1;
    }
    this.detailObj.cashSalesTemplate.iscjzd18 = 0;
    if (this.cashSalesTemplate.iscjzd18 == true) {
      this.detailObj.cashSalesTemplate.iscjzd18 = 1;
    }

    // 第22条
    this.detailObj.cashSalesTemplate.iskdd22 = 0;
    if (this.cashSalesTemplate.iskdd22 == true) {
      this.detailObj.cashSalesTemplate.iskdd22 = 1;
    }
    this.detailObj.cashSalesTemplate.isghxd22 = 0;
    if (this.cashSalesTemplate.isghxd22 == true) {
      this.detailObj.cashSalesTemplate.isghxd22 = 1;
    }


  }

  // 预售合同数据填充
  getAdvanceSalesTemplate() {

    this.detailObj.advanceSalesTemplate.id = '';
    this.detailObj.advanceSalesTemplate.housetradeid = '';
    // 合同开头
    this.detailObj.advanceSalesTemplate.ht1 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.ht1)) {
      this.detailObj.advanceSalesTemplate.ht1 = this.advanceSalesTemplate.ht1;
    }
    this.detailObj.advanceSalesTemplate.ht2 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.ht2)) {
      this.detailObj.advanceSalesTemplate.ht2 = this.advanceSalesTemplate.ht2;
    }
    this.detailObj.advanceSalesTemplate.ht3 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.ht3)) {
      this.detailObj.advanceSalesTemplate.ht3 = this.advanceSalesTemplate.ht3;
    }

    // 出卖人
    this.detailObj.advanceSalesTemplate.jf1 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.jf1)) {
      this.detailObj.advanceSalesTemplate.jf1 = this.advanceSalesTemplate.jf1;
    }
    this.detailObj.advanceSalesTemplate.jf2 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.jf2)) {
      this.detailObj.advanceSalesTemplate.jf2 = this.advanceSalesTemplate.jf2;
    }
    this.detailObj.advanceSalesTemplate.jf3 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.jf3)) {
      this.detailObj.advanceSalesTemplate.jf3 = this.advanceSalesTemplate.jf3;
    }
    this.detailObj.advanceSalesTemplate.jf4 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.jf4)) {
      this.detailObj.advanceSalesTemplate.jf4 = this.advanceSalesTemplate.jf4;
    }
    this.detailObj.advanceSalesTemplate.jf5 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.jf5)) {
      this.detailObj.advanceSalesTemplate.jf5 = this.advanceSalesTemplate.jf5;
    }
    this.detailObj.advanceSalesTemplate.jf6 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.jf6)) {
      this.detailObj.advanceSalesTemplate.jf6 = this.advanceSalesTemplate.jf6;
    }
    this.detailObj.advanceSalesTemplate.jf7 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.jf7)) {
      this.detailObj.advanceSalesTemplate.jf7 = this.advanceSalesTemplate.jf7;
    }
    this.detailObj.advanceSalesTemplate.jf8 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.jf8)) {
      this.detailObj.advanceSalesTemplate.jf8 = this.advanceSalesTemplate.jf8;
    }
    this.detailObj.advanceSalesTemplate.jf9 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.jf9)) {
      this.detailObj.advanceSalesTemplate.jf9 = this.advanceSalesTemplate.jf9;
    }
    this.detailObj.advanceSalesTemplate.jf10 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.jf10)) {
      this.detailObj.advanceSalesTemplate.jf10 = this.advanceSalesTemplate.jf10;
    }
    this.detailObj.advanceSalesTemplate.jf11 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.jf11)) {
      this.detailObj.advanceSalesTemplate.jf11 = this.advanceSalesTemplate.jf11;
    }
    this.detailObj.advanceSalesTemplate.jf12 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.jf12)) {
      this.detailObj.advanceSalesTemplate.jf12 = this.advanceSalesTemplate.jf12;
    }
    this.detailObj.advanceSalesTemplate.jf13 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.jf13)) {
      this.detailObj.advanceSalesTemplate.jf13 = this.advanceSalesTemplate.jf13;
    }
    this.detailObj.advanceSalesTemplate.jf14 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.jf14)) {
      this.detailObj.advanceSalesTemplate.jf14 = this.advanceSalesTemplate.jf14;
    }
    this.detailObj.advanceSalesTemplate.jf15 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.jf15)) {
      this.detailObj.advanceSalesTemplate.jf15 = this.advanceSalesTemplate.jf15;
    }
    this.detailObj.advanceSalesTemplate.jf16 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.jf16)) {
      this.detailObj.advanceSalesTemplate.jf16 = this.advanceSalesTemplate.jf16;
    }
    // 买受人
    this.detailObj.advanceSalesTemplate.yf1 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.yf1)) {
      this.detailObj.advanceSalesTemplate.yf1 = this.advanceSalesTemplate.yf1;
    }
    this.detailObj.advanceSalesTemplate.yf2 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.yf2)) {
      this.detailObj.advanceSalesTemplate.yf2 = this.advanceSalesTemplate.yf2;
    }
    this.detailObj.advanceSalesTemplate.yf3 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.yf3)) {
      this.detailObj.advanceSalesTemplate.yf3 = this.advanceSalesTemplate.yf3;
    }
    this.detailObj.advanceSalesTemplate.yf4 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.yf4)) {
      this.detailObj.advanceSalesTemplate.yf4 = this.advanceSalesTemplate.yf4;
    }
    this.detailObj.advanceSalesTemplate.yf5 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.yf5)) {
      this.detailObj.advanceSalesTemplate.yf5 = this.advanceSalesTemplate.yf5;
    }
    // this.detailObj.advanceSalesTemplate.yf6 = '';
    // if (!this.isEmpty(this.advanceSalesTemplate.yf6)) {
    this.detailObj.advanceSalesTemplate.yf6 = this.advanceSalesTemplate.yf6;
    // }
    this.detailObj.advanceSalesTemplate.yf7 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.yf7)) {
      this.detailObj.advanceSalesTemplate.yf7 = this.advanceSalesTemplate.yf7;
    }
    this.detailObj.advanceSalesTemplate.yf8 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.yf8)) {
      this.detailObj.advanceSalesTemplate.yf8 = this.advanceSalesTemplate.yf8;
    }
    this.detailObj.advanceSalesTemplate.yf9 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.yf9)) {
      this.detailObj.advanceSalesTemplate.yf9 = this.advanceSalesTemplate.yf9;
    }
    this.detailObj.advanceSalesTemplate.yf10 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.yf10)) {
      this.detailObj.advanceSalesTemplate.yf10 = this.advanceSalesTemplate.yf10;
    }
    this.detailObj.advanceSalesTemplate.yf11 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.yf11)) {
      this.detailObj.advanceSalesTemplate.yf11 = this.advanceSalesTemplate.yf11;
    }
    this.detailObj.advanceSalesTemplate.yf12 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.yf12)) {
      this.detailObj.advanceSalesTemplate.yf12 = this.advanceSalesTemplate.yf12;
    }
    this.detailObj.advanceSalesTemplate.yf13 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.yf13)) {
      this.detailObj.advanceSalesTemplate.yf13 = this.advanceSalesTemplate.yf13;
    }
    this.detailObj.advanceSalesTemplate.yf14 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.yf14)) {
      this.detailObj.advanceSalesTemplate.yf14 = this.advanceSalesTemplate.yf14;
    }
    // this.detailObj.advanceSalesTemplate.yf15 = '';
    // if (!this.isEmpty(this.advanceSalesTemplate.yf15)) {
    this.detailObj.advanceSalesTemplate.yf15 = this.advanceSalesTemplate.yf15;
    // }
    this.detailObj.advanceSalesTemplate.yf16 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.yf16)) {
      this.detailObj.advanceSalesTemplate.yf16 = this.advanceSalesTemplate.yf16;
    }
    this.detailObj.advanceSalesTemplate.yf17 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.yf17)) {
      this.detailObj.advanceSalesTemplate.yf17 = this.advanceSalesTemplate.yf17;
    }
    this.detailObj.advanceSalesTemplate.yf18 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.yf18)) {
      this.detailObj.advanceSalesTemplate.yf18 = this.advanceSalesTemplate.yf18;
    }
    this.detailObj.advanceSalesTemplate.yf19 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.yf19)) {
      this.detailObj.advanceSalesTemplate.yf19 = this.advanceSalesTemplate.yf19;
    }

    // 第1条
    this.detailObj.advanceSalesTemplate.d1t1 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d1t1)) {
      this.detailObj.advanceSalesTemplate.d1t1 = this.advanceSalesTemplate.d1t1;
    }
    this.detailObj.advanceSalesTemplate.d1t2 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d1t2)) {
      this.detailObj.advanceSalesTemplate.d1t2 = this.advanceSalesTemplate.d1t2;
    }
    this.detailObj.advanceSalesTemplate.d1t3 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d1t3)) {
      this.detailObj.advanceSalesTemplate.d1t3 = this.advanceSalesTemplate.d1t3;
    }
    this.detailObj.advanceSalesTemplate.d1t4 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d1t4)) {
      this.detailObj.advanceSalesTemplate.d1t4 = this.advanceSalesTemplate.d1t4;
    }
    this.detailObj.advanceSalesTemplate.d1t5 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d1t5)) {
      this.detailObj.advanceSalesTemplate.d1t5 = this.advanceSalesTemplate.d1t5;
    }
    this.detailObj.advanceSalesTemplate.d1t6 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d1t6)) {
      this.detailObj.advanceSalesTemplate.d1t6 = this.advanceSalesTemplate.d1t6;
    }
    // this.detailObj.advanceSalesTemplate.d1t7 = '';
    // if (!this.isEmpty(this.advanceSalesTemplate.d1t7)) {
    this.detailObj.advanceSalesTemplate.d1t7 = this.advanceSalesTemplate.d1t7;
    // }
    this.detailObj.advanceSalesTemplate.d1t8 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d1t8)) {
      this.detailObj.advanceSalesTemplate.d1t8 = this.advanceSalesTemplate.d1t8;
    }
    this.detailObj.advanceSalesTemplate.d1t9 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d1t9)) {
      this.detailObj.advanceSalesTemplate.d1t9 = this.advanceSalesTemplate.d1t9;
    }
    this.detailObj.advanceSalesTemplate.d1t10 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d1t10)) {
      this.detailObj.advanceSalesTemplate.d1t10 = this.advanceSalesTemplate.d1t10;
    }

    // 第2条
    this.detailObj.advanceSalesTemplate.d2t1 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d2t1)) {
      this.detailObj.advanceSalesTemplate.d2t1 = this.advanceSalesTemplate.d2t1;
    }
    this.detailObj.advanceSalesTemplate.d2t2 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d2t2)) {
      this.detailObj.advanceSalesTemplate.d2t2 = this.advanceSalesTemplate.d2t2;
    }

    // 第3条
    this.detailObj.advanceSalesTemplate.d3t1 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d3t1)) {
      this.detailObj.advanceSalesTemplate.d3t1 = this.advanceSalesTemplate.d3t1;
    }
    this.detailObj.advanceSalesTemplate.d3t2 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d3t2)) {
      this.detailObj.advanceSalesTemplate.d3t2 = this.advanceSalesTemplate.d3t2;
    }
    this.detailObj.advanceSalesTemplate.d3t3 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d3t3)) {
      this.detailObj.advanceSalesTemplate.d3t3 = this.advanceSalesTemplate.d3t3;
    }
    this.detailObj.advanceSalesTemplate.d3t4 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d3t4)) {
      this.detailObj.advanceSalesTemplate.d3t4 = this.advanceSalesTemplate.d3t4;
    }
    this.detailObj.advanceSalesTemplate.d3t5 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d3t5)) {
      this.detailObj.advanceSalesTemplate.d3t5 = this.advanceSalesTemplate.d3t5;
    }
    this.detailObj.advanceSalesTemplate.d3t6 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d3t6)) {
      this.detailObj.advanceSalesTemplate.d3t6 = this.advanceSalesTemplate.d3t6;
    }
    this.detailObj.advanceSalesTemplate.d3t7 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d3t7)) {
      this.detailObj.advanceSalesTemplate.d3t7 = this.advanceSalesTemplate.d3t7;
    }
    this.detailObj.advanceSalesTemplate.d3t8 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d3t8)) {
      this.detailObj.advanceSalesTemplate.d3t8 = this.advanceSalesTemplate.d3t8;
    }
    this.detailObj.advanceSalesTemplate.d3t9 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d3t9)) {
      this.detailObj.advanceSalesTemplate.d3t9 = this.advanceSalesTemplate.d3t9;
    }
    this.detailObj.advanceSalesTemplate.d3t10 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d3t10)) {
      this.detailObj.advanceSalesTemplate.d3t10 = this.advanceSalesTemplate.d3t10;
    }
    this.detailObj.advanceSalesTemplate.d3t11 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d3t11)) {
      this.detailObj.advanceSalesTemplate.d3t11 = this.advanceSalesTemplate.d3t11;
    }
    this.detailObj.advanceSalesTemplate.d3t12 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d3t12)) {
      this.detailObj.advanceSalesTemplate.d3t12 = this.advanceSalesTemplate.d3t12;
    }
    this.detailObj.advanceSalesTemplate.d3t13 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d3t13)) {
      this.detailObj.advanceSalesTemplate.d3t13 = this.advanceSalesTemplate.d3t13;
    }
    this.detailObj.advanceSalesTemplate.d3t14 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d3t14)) {
      this.detailObj.advanceSalesTemplate.d3t14 = this.advanceSalesTemplate.d3t14;
    }
    this.detailObj.advanceSalesTemplate.d3t15 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d3t15)) {
      this.detailObj.advanceSalesTemplate.d3t15 = this.advanceSalesTemplate.d3t15;
    }
    this.detailObj.advanceSalesTemplate.d3t16 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d3t16)) {
      this.detailObj.advanceSalesTemplate.d3t16 = this.advanceSalesTemplate.d3t16;
    }
    this.detailObj.advanceSalesTemplate.d3t17 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d3t17)) {
      this.detailObj.advanceSalesTemplate.d3t17 = this.advanceSalesTemplate.d3t17;
    }
    this.detailObj.advanceSalesTemplate.d3t18 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d3t18)) {
      this.detailObj.advanceSalesTemplate.d3t18 = this.advanceSalesTemplate.d3t18;
    }

    // 第四条
    this.detailObj.advanceSalesTemplate.d4t1 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d4t1)) {
      this.detailObj.advanceSalesTemplate.d4t1 = this.advanceSalesTemplate.d4t1;
    }
    this.detailObj.advanceSalesTemplate.d4t2 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d4t2)) {
      this.detailObj.advanceSalesTemplate.d4t2 = this.advanceSalesTemplate.d4t2;
    }
    this.detailObj.advanceSalesTemplate.d4t3 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d4t3)) {
      this.detailObj.advanceSalesTemplate.d4t3 = this.advanceSalesTemplate.d4t3;
    }
    this.detailObj.advanceSalesTemplate.d4t4 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d4t4)) {
      this.detailObj.advanceSalesTemplate.d4t4 = this.advanceSalesTemplate.d4t4;
    }
    // this.detailObj.advanceSalesTemplate.d4t5 = '';
    // if (!this.isEmpty(this.advanceSalesTemplate.d4t5)) {
    this.detailObj.advanceSalesTemplate.d4t5 = this.advanceSalesTemplate.d4t5;
    // }
    this.detailObj.advanceSalesTemplate.d4t6 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d4t6)) {
      this.detailObj.advanceSalesTemplate.d4t6 = this.advanceSalesTemplate.d4t6;
    }
    this.detailObj.advanceSalesTemplate.d4t7 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d4t7)) {
      this.detailObj.advanceSalesTemplate.d4t7 = this.advanceSalesTemplate.d4t7;
    }
    this.detailObj.advanceSalesTemplate.d4t8 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d4t8)) {
      this.detailObj.advanceSalesTemplate.d4t8 = this.advanceSalesTemplate.d4t8;
    }
    this.detailObj.advanceSalesTemplate.d4t9 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d4t9)) {
      this.detailObj.advanceSalesTemplate.d4t9 = this.advanceSalesTemplate.d4t9;
    }
    this.detailObj.advanceSalesTemplate.d4t10 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d4t10)) {
      this.detailObj.advanceSalesTemplate.d4t10 = this.advanceSalesTemplate.d4t10;
    }
    // this.detailObj.advanceSalesTemplate.d4t11 = '';
    // if (!this.isEmpty(this.advanceSalesTemplate.d4t11)) {
    this.detailObj.advanceSalesTemplate.d4t11 = this.advanceSalesTemplate.d4t11;
    // }
    this.detailObj.advanceSalesTemplate.d4t12 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d4t12)) {
      this.detailObj.advanceSalesTemplate.d4t12 = this.advanceSalesTemplate.d4t12;
    }

    // 第五条
    this.detailObj.advanceSalesTemplate.d5t1 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d5t1)) {
      this.detailObj.advanceSalesTemplate.d5t1 = this.advanceSalesTemplate.d5t1;
    }
    this.detailObj.advanceSalesTemplate.d5t2 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d5t2)) {
      this.detailObj.advanceSalesTemplate.d5t2 = this.advanceSalesTemplate.d5t2;
    }
    this.detailObj.advanceSalesTemplate.d5t3 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d5t3)) {
      this.detailObj.advanceSalesTemplate.d5t3 = this.advanceSalesTemplate.d5t3;
    }

    // 第六条
    this.detailObj.advanceSalesTemplate.d6t1 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d6t1)) {
      this.detailObj.advanceSalesTemplate.d6t1 = this.advanceSalesTemplate.d6t1;
    }
    this.detailObj.advanceSalesTemplate.d6t2 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d6t2)) {
      this.detailObj.advanceSalesTemplate.d6t2 = this.advanceSalesTemplate.d6t2;
    }
    this.detailObj.advanceSalesTemplate.d6t3 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d6t3)) {
      this.detailObj.advanceSalesTemplate.d6t3 = this.advanceSalesTemplate.d6t3;
    }
    this.detailObj.advanceSalesTemplate.d6t4 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d6t4)) {
      this.detailObj.advanceSalesTemplate.d6t4 = this.advanceSalesTemplate.d6t4;
    }
    this.detailObj.advanceSalesTemplate.d6t5 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d6t5)) {
      this.detailObj.advanceSalesTemplate.d6t5 = this.advanceSalesTemplate.d6t5;
    }
    this.detailObj.advanceSalesTemplate.d6t6 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d6t6)) {
      this.detailObj.advanceSalesTemplate.d6t6 = this.advanceSalesTemplate.d6t6;
    }
    this.detailObj.advanceSalesTemplate.d6t7 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d6t7)) {
      this.detailObj.advanceSalesTemplate.d6t7 = this.advanceSalesTemplate.d6t7;
    }
    this.detailObj.advanceSalesTemplate.d6t8 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d6t8)) {
      this.detailObj.advanceSalesTemplate.d6t8 = this.advanceSalesTemplate.d6t8;
    }
    this.detailObj.advanceSalesTemplate.d6t9 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d6t9)) {
      this.detailObj.advanceSalesTemplate.d6t9 = this.advanceSalesTemplate.d6t9;
    }
    this.detailObj.advanceSalesTemplate.d6t10 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d6t10)) {
      this.detailObj.advanceSalesTemplate.d6t10 = this.advanceSalesTemplate.d6t10;
    }
    this.detailObj.advanceSalesTemplate.d6t11 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d6t11)) {
      this.detailObj.advanceSalesTemplate.d6t11 = this.advanceSalesTemplate.d6t11;
    }
    this.detailObj.advanceSalesTemplate.d6t12 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d6t12)) {
      this.detailObj.advanceSalesTemplate.d6t12 = this.advanceSalesTemplate.d6t12;
    }
    this.detailObj.advanceSalesTemplate.d6t13 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d6t13)) {
      this.detailObj.advanceSalesTemplate.d6t13 = this.advanceSalesTemplate.d6t13;
    }
    this.detailObj.advanceSalesTemplate.d6t14 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d6t14)) {
      this.detailObj.advanceSalesTemplate.d6t14 = this.advanceSalesTemplate.d6t14;
    }
    this.detailObj.advanceSalesTemplate.d6t15 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d6t15)) {
      this.detailObj.advanceSalesTemplate.d6t15 = this.advanceSalesTemplate.d6t15;
    }
    this.detailObj.advanceSalesTemplate.d6t16 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d6t16)) {
      this.detailObj.advanceSalesTemplate.d6t16 = this.advanceSalesTemplate.d6t16;
    }
    this.detailObj.advanceSalesTemplate.d6t17 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d6t17)) {
      this.detailObj.advanceSalesTemplate.d6t17 = this.advanceSalesTemplate.d6t17;
    }
    this.detailObj.advanceSalesTemplate.d6t18 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d6t18)) {
      this.detailObj.advanceSalesTemplate.d6t18 = this.advanceSalesTemplate.d6t18;
    }


    // 第七条
    this.detailObj.advanceSalesTemplate.d7t1 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d7t1)) {
      this.detailObj.advanceSalesTemplate.d7t1 = this.advanceSalesTemplate.d7t1;
    }
    this.detailObj.advanceSalesTemplate.d7t2 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d7t2)) {
      this.detailObj.advanceSalesTemplate.d7t2 = this.advanceSalesTemplate.d7t2;
    }
    this.detailObj.advanceSalesTemplate.d7t3 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d7t3)) {
      this.detailObj.advanceSalesTemplate.d7t3 = this.advanceSalesTemplate.d7t3;
    }
    this.detailObj.advanceSalesTemplate.d7t4 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d7t4)) {
      this.detailObj.advanceSalesTemplate.d7t4 = this.advanceSalesTemplate.d7t4;
    }
    this.detailObj.advanceSalesTemplate.d7t5 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d7t5)) {
      this.detailObj.advanceSalesTemplate.d7t5 = this.advanceSalesTemplate.d7t5;
    }
    // this.detailObj.advanceSalesTemplate.d7t6 = '';
    // if (!this.isEmpty(this.advanceSalesTemplate.d7t6)) {
    this.detailObj.advanceSalesTemplate.d7t6 = this.advanceSalesTemplate.d7t6;
    // }
    // this.detailObj.advanceSalesTemplate.d7t7 = '';
    // if (!this.isEmpty(this.advanceSalesTemplate.d7t7)) {
    this.detailObj.advanceSalesTemplate.d7t7 = this.advanceSalesTemplate.d7t7;
    // }
    this.detailObj.advanceSalesTemplate.d7t8 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d7t8)) {
      this.detailObj.advanceSalesTemplate.d7t8 = this.advanceSalesTemplate.d7t8;
    }
    this.detailObj.advanceSalesTemplate.d7t9 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d7t9)) {
      this.detailObj.advanceSalesTemplate.d7t9 = this.advanceSalesTemplate.d7t9;
    }
    this.detailObj.advanceSalesTemplate.d7t10 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d7t10)) {
      this.detailObj.advanceSalesTemplate.d7t10 = this.advanceSalesTemplate.d7t10;
    }
    this.detailObj.advanceSalesTemplate.d7t11 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d7t11)) {
      this.detailObj.advanceSalesTemplate.d7t11 = this.advanceSalesTemplate.d7t11;
    }
    // this.detailObj.advanceSalesTemplate.d7t12 = '';
    // if (!this.isEmpty(this.advanceSalesTemplate.d7t12)) {
    this.detailObj.advanceSalesTemplate.d7t12 = this.advanceSalesTemplate.d7t12;
    // }
    this.detailObj.advanceSalesTemplate.d7t13 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d7t13)) {
      this.detailObj.advanceSalesTemplate.d7t13 = this.advanceSalesTemplate.d7t13;
    }
    this.detailObj.advanceSalesTemplate.d7t14 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d7t14)) {
      this.detailObj.advanceSalesTemplate.d7t14 = this.advanceSalesTemplate.d7t14;
    }
    // this.detailObj.advanceSalesTemplate.d7t15 = '';
    // if (!this.isEmpty(this.advanceSalesTemplate.d7t15)) {
    this.detailObj.advanceSalesTemplate.d7t15 = this.advanceSalesTemplate.d7t15;
    // }
    this.detailObj.advanceSalesTemplate.d7t16 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d7t16)) {
      this.detailObj.advanceSalesTemplate.d7t16 = this.advanceSalesTemplate.d7t16;
    }
    this.detailObj.advanceSalesTemplate.d7t17 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d7t17)) {
      this.detailObj.advanceSalesTemplate.d7t17 = this.advanceSalesTemplate.d7t17;
    }
    this.detailObj.advanceSalesTemplate.d7t18 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d7t18)) {
      this.detailObj.advanceSalesTemplate.d7t18 = this.advanceSalesTemplate.d7t18;
    }
    this.detailObj.advanceSalesTemplate.d7t19 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d7t19)) {
      this.detailObj.advanceSalesTemplate.d7t19 = this.advanceSalesTemplate.d7t19;
    }
    this.detailObj.advanceSalesTemplate.d7t20 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d7t20)) {
      this.detailObj.advanceSalesTemplate.d7t20 = this.advanceSalesTemplate.d7t20;
    }
    this.detailObj.advanceSalesTemplate.d7t21 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d7t21)) {
      this.detailObj.advanceSalesTemplate.d7t21 = this.advanceSalesTemplate.d7t21;
    }
    this.detailObj.advanceSalesTemplate.d7t22 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d7t22)) {
      this.detailObj.advanceSalesTemplate.d7t22 = this.advanceSalesTemplate.d7t22;
    }
    this.detailObj.advanceSalesTemplate.d7t23 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d7t23)) {
      this.detailObj.advanceSalesTemplate.d7t23 = this.advanceSalesTemplate.d7t23;
    }
    this.detailObj.advanceSalesTemplate.d7t24 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d7t24)) {
      this.detailObj.advanceSalesTemplate.d7t24 = this.advanceSalesTemplate.d7t24;
    }
    this.detailObj.advanceSalesTemplate.d7t25 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d7t25)) {
      this.detailObj.advanceSalesTemplate.d7t25 = this.advanceSalesTemplate.d7t25;
    }
    this.detailObj.advanceSalesTemplate.d7t26 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d7t26)) {
      this.detailObj.advanceSalesTemplate.d7t26 = this.advanceSalesTemplate.d7t26;
    }
    this.detailObj.advanceSalesTemplate.d7t27 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d7t27)) {
      this.detailObj.advanceSalesTemplate.d7t27 = this.advanceSalesTemplate.d7t27;
    }

    // 第八条
    this.detailObj.advanceSalesTemplate.d8t1 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d8t1)) {
      this.detailObj.advanceSalesTemplate.d8t1 = this.advanceSalesTemplate.d8t1;
    }
    this.detailObj.advanceSalesTemplate.d8t2 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d8t2)) {
      this.detailObj.advanceSalesTemplate.d8t2 = this.advanceSalesTemplate.d8t2;
    }
    this.detailObj.advanceSalesTemplate.d8t3 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d8t3)) {
      this.detailObj.advanceSalesTemplate.d8t3 = this.advanceSalesTemplate.d8t3;
    }
    this.detailObj.advanceSalesTemplate.d8t4 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d8t4)) {
      this.detailObj.advanceSalesTemplate.d8t4 = this.advanceSalesTemplate.d8t4;
    }
    this.detailObj.advanceSalesTemplate.d8t5 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d8t5)) {
      this.detailObj.advanceSalesTemplate.d8t5 = this.advanceSalesTemplate.d8t5;
    }
    this.detailObj.advanceSalesTemplate.d8t6 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d8t6)) {
      this.detailObj.advanceSalesTemplate.d8t6 = this.advanceSalesTemplate.d8t6;
    }
    this.detailObj.advanceSalesTemplate.d8t7 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d8t7)) {
      this.detailObj.advanceSalesTemplate.d8t7 = this.advanceSalesTemplate.d8t7;
    }
    this.detailObj.advanceSalesTemplate.d8t8 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d8t8)) {
      this.detailObj.advanceSalesTemplate.d8t8 = this.advanceSalesTemplate.d8t8;
    }


    // 第九条
    this.detailObj.advanceSalesTemplate.d9t1 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d9t1)) {
      this.detailObj.advanceSalesTemplate.d9t1 = this.advanceSalesTemplate.d9t1;
    }
    this.detailObj.advanceSalesTemplate.d9t2 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d9t2)) {
      this.detailObj.advanceSalesTemplate.d9t2 = this.advanceSalesTemplate.d9t2;
    }
    this.detailObj.advanceSalesTemplate.d9t3 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d9t3)) {
      this.detailObj.advanceSalesTemplate.d9t3 = this.advanceSalesTemplate.d9t3;
    }
    this.detailObj.advanceSalesTemplate.d9t4 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d9t4)) {
      this.detailObj.advanceSalesTemplate.d9t4 = this.advanceSalesTemplate.d9t4;
    }


    // 第十条
    this.detailObj.advanceSalesTemplate.d10t1 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d10t1)) {
      this.detailObj.advanceSalesTemplate.d10t1 = this.advanceSalesTemplate.d10t1;
    }
    this.detailObj.advanceSalesTemplate.d10t2 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d10t2)) {
      this.detailObj.advanceSalesTemplate.d10t2 = this.advanceSalesTemplate.d10t2;
    }
    this.detailObj.advanceSalesTemplate.d10t3 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d10t3)) {
      this.detailObj.advanceSalesTemplate.d10t3 = this.advanceSalesTemplate.d10t3;
    }
    this.detailObj.advanceSalesTemplate.d10t4 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d10t4)) {
      this.detailObj.advanceSalesTemplate.d10t4 = this.advanceSalesTemplate.d10t4;
    }
    this.detailObj.advanceSalesTemplate.d10t5 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d10t5)) {
      this.detailObj.advanceSalesTemplate.d10t5 = this.advanceSalesTemplate.d10t5;
    }
    this.detailObj.advanceSalesTemplate.d10t6 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d10t6)) {
      this.detailObj.advanceSalesTemplate.d10t6 = this.advanceSalesTemplate.d10t6;
    }
    this.detailObj.advanceSalesTemplate.d10t7 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d10t7)) {
      this.detailObj.advanceSalesTemplate.d10t7 = this.advanceSalesTemplate.d10t7;
    }
    this.detailObj.advanceSalesTemplate.d10t8 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d10t8)) {
      this.detailObj.advanceSalesTemplate.d10t8 = this.advanceSalesTemplate.d10t8;
    }
    this.detailObj.advanceSalesTemplate.d10t9 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d10t9)) {
      this.detailObj.advanceSalesTemplate.d10t9 = this.advanceSalesTemplate.d10t9;
    }
    this.detailObj.advanceSalesTemplate.d10t10 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d10t10)) {
      this.detailObj.advanceSalesTemplate.d10t10 = this.advanceSalesTemplate.d10t10;
    }
    // this.detailObj.advanceSalesTemplate.d10t11 = '';
    // if (!this.isEmpty(this.advanceSalesTemplate.d10t11)) {
    this.detailObj.advanceSalesTemplate.d10t11 = this.advanceSalesTemplate.d10t11;
    // }
    this.detailObj.advanceSalesTemplate.d10t12 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d10t12)) {
      this.detailObj.advanceSalesTemplate.d10t12 = this.advanceSalesTemplate.d10t12;
    }
    // this.detailObj.advanceSalesTemplate.d10t13 = '';
    // if (!this.isEmpty(this.advanceSalesTemplate.d10t13)) {
    this.detailObj.advanceSalesTemplate.d10t13 = this.advanceSalesTemplate.d10t13;
    // }
    this.detailObj.advanceSalesTemplate.d10t14 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d10t14)) {
      this.detailObj.advanceSalesTemplate.d10t14 = this.advanceSalesTemplate.d10t14;
    }
    // this.detailObj.advanceSalesTemplate.d10t15 = '';
    // if (!this.isEmpty(this.advanceSalesTemplate.d10t15)) {
    this.detailObj.advanceSalesTemplate.d10t15 = this.advanceSalesTemplate.d10t15;
    // }
    this.detailObj.advanceSalesTemplate.d10t16 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d10t16)) {
      this.detailObj.advanceSalesTemplate.d10t16 = this.advanceSalesTemplate.d10t16;
    }
    // this.detailObj.advanceSalesTemplate.d10t17 = '';
    // if (!this.isEmpty(this.advanceSalesTemplate.d10t17)) {
    this.detailObj.advanceSalesTemplate.d10t17 = this.advanceSalesTemplate.d10t17;
    // }
    this.detailObj.advanceSalesTemplate.d10t18 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d10t18)) {
      this.detailObj.advanceSalesTemplate.d10t18 = this.advanceSalesTemplate.d10t18;
    }
    // this.detailObj.advanceSalesTemplate.d10t19 = '';
    // if (!this.isEmpty(this.advanceSalesTemplate.d10t19)) {
    this.detailObj.advanceSalesTemplate.d10t19 = this.advanceSalesTemplate.d10t19;
    // }
    this.detailObj.advanceSalesTemplate.d10t20 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d10t20)) {
      this.detailObj.advanceSalesTemplate.d10t20 = this.advanceSalesTemplate.d10t20;
    }
    // this.detailObj.advanceSalesTemplate.d10t21 = '';
    // if (!this.isEmpty(this.advanceSalesTemplate.d10t21)) {
    this.detailObj.advanceSalesTemplate.d10t21 = this.advanceSalesTemplate.d10t21;
    // }
    this.detailObj.advanceSalesTemplate.d10t22 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d10t22)) {
      this.detailObj.advanceSalesTemplate.d10t22 = this.advanceSalesTemplate.d10t22;
    }
    // this.detailObj.advanceSalesTemplate.d10t23 = '';
    // if (!this.isEmpty(this.advanceSalesTemplate.d10t23)) {
    this.detailObj.advanceSalesTemplate.d10t23 = this.advanceSalesTemplate.d10t23;
    // }
    this.detailObj.advanceSalesTemplate.d10t24 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d10t24)) {
      this.detailObj.advanceSalesTemplate.d10t24 = this.advanceSalesTemplate.d10t24;
    }
    this.detailObj.advanceSalesTemplate.d10t25 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d10t25)) {
      this.detailObj.advanceSalesTemplate.d10t25 = this.advanceSalesTemplate.d10t25;
    }
    this.detailObj.advanceSalesTemplate.d10t26 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d10t26)) {
      this.detailObj.advanceSalesTemplate.d10t26 = this.advanceSalesTemplate.d10t26;
    }
    this.detailObj.advanceSalesTemplate.d10t27 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d10t27)) {
      this.detailObj.advanceSalesTemplate.d10t27 = this.advanceSalesTemplate.d10t27;
    }
    this.detailObj.advanceSalesTemplate.d10t28 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d10t28)) {
      this.detailObj.advanceSalesTemplate.d10t18 = this.advanceSalesTemplate.d10t28;
    }
    this.detailObj.advanceSalesTemplate.d10t29 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d10t29)) {
      this.detailObj.advanceSalesTemplate.d10t29 = this.advanceSalesTemplate.d10t29;
    }
    this.detailObj.advanceSalesTemplate.d10t30 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d10t30)) {
      this.detailObj.advanceSalesTemplate.d10t30 = this.advanceSalesTemplate.d10t30;
    }
    this.detailObj.advanceSalesTemplate.d10t31 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d10t31)) {
      this.detailObj.advanceSalesTemplate.d10t31 = this.advanceSalesTemplate.d10t31;
    }

    // 第十一条
    // this.detailObj.advanceSalesTemplate.d11t1 = '';
    // if (!this.isEmpty(this.advanceSalesTemplate.d11t1)) {
    this.detailObj.advanceSalesTemplate.d11t1 = this.advanceSalesTemplate.d11t1;
    // }
    this.detailObj.advanceSalesTemplate.d11t2 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d11t2)) {
      this.detailObj.advanceSalesTemplate.d11t2 = this.advanceSalesTemplate.d11t2;
    }
    this.detailObj.advanceSalesTemplate.d11t3 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d11t3)) {
      this.detailObj.advanceSalesTemplate.d11t3 = this.advanceSalesTemplate.d11t3;
    }
    this.detailObj.advanceSalesTemplate.d11t4 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d11t4)) {
      this.detailObj.advanceSalesTemplate.d11t4 = this.advanceSalesTemplate.d11t4;
    }
    this.detailObj.advanceSalesTemplate.d11t5 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d11t5)) {
      this.detailObj.advanceSalesTemplate.d11t5 = this.advanceSalesTemplate.d11t5;
    }
    this.detailObj.advanceSalesTemplate.d11t6 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d11t6)) {
      this.detailObj.advanceSalesTemplate.d11t6 = this.advanceSalesTemplate.d11t6;
    }
    this.detailObj.advanceSalesTemplate.d11t7 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d11t7)) {
      this.detailObj.advanceSalesTemplate.d11t7 = this.advanceSalesTemplate.d11t7;
    }
    this.detailObj.advanceSalesTemplate.d11t8 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d11t8)) {
      this.detailObj.advanceSalesTemplate.d11t8 = this.advanceSalesTemplate.d11t8;
    }


    // 第十二条
    this.detailObj.advanceSalesTemplate.d12t1 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d12t1)) {
      this.detailObj.advanceSalesTemplate.d12t1 = this.advanceSalesTemplate.d12t1;
    }
    this.detailObj.advanceSalesTemplate.d12t2 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d12t2)) {
      this.detailObj.advanceSalesTemplate.d12t2 = this.advanceSalesTemplate.d12t2;
    }
    this.detailObj.advanceSalesTemplate.d12t3 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d12t3)) {
      this.detailObj.advanceSalesTemplate.d12t3 = this.advanceSalesTemplate.d12t3;
    }
    this.detailObj.advanceSalesTemplate.d12t4 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d12t4)) {
      this.detailObj.advanceSalesTemplate.d12t4 = this.advanceSalesTemplate.d12t4;
    }
    this.detailObj.advanceSalesTemplate.d12t5 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d12t5)) {
      this.detailObj.advanceSalesTemplate.d12t5 = this.advanceSalesTemplate.d12t5;
    }
    this.detailObj.advanceSalesTemplate.d12t6 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d12t6)) {
      this.detailObj.advanceSalesTemplate.d12t6 = this.advanceSalesTemplate.d12t6;
    }
    this.detailObj.advanceSalesTemplate.d12t7 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d12t7)) {
      this.detailObj.advanceSalesTemplate.d12t7 = this.advanceSalesTemplate.d12t7;
    }
    this.detailObj.advanceSalesTemplate.d12t8 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d12t8)) {
      this.detailObj.advanceSalesTemplate.d12t8 = this.advanceSalesTemplate.d12t8;
    }

    // 第十三条
    this.detailObj.advanceSalesTemplate.d13t1 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d13t1)) {
      this.detailObj.advanceSalesTemplate.d13t1 = this.advanceSalesTemplate.d13t1;
    }
    this.detailObj.advanceSalesTemplate.d13t2 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d13t2)) {
      this.detailObj.advanceSalesTemplate.d13t2 = this.advanceSalesTemplate.d13t2;
    }
    this.detailObj.advanceSalesTemplate.d13t3 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d13t3)) {
      this.detailObj.advanceSalesTemplate.d13t3 = this.advanceSalesTemplate.d13t3;
    }
    this.detailObj.advanceSalesTemplate.d13t4 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d13t4)) {
      this.detailObj.advanceSalesTemplate.d13t4 = this.advanceSalesTemplate.d13t4;
    }
    this.detailObj.advanceSalesTemplate.d13t5 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d13t5)) {
      this.detailObj.advanceSalesTemplate.d13t5 = this.advanceSalesTemplate.d13t5;
    }
    this.detailObj.advanceSalesTemplate.d13t6 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d13t6)) {
      this.detailObj.advanceSalesTemplate.d13t6 = this.advanceSalesTemplate.d13t6;
    }
    this.detailObj.advanceSalesTemplate.d13t7 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d13t7)) {
      this.detailObj.advanceSalesTemplate.d13t7 = this.advanceSalesTemplate.d13t7;
    }



    // 第14条
    this.detailObj.advanceSalesTemplate.d14t1 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d14t1)) {
      this.detailObj.advanceSalesTemplate.d14t1 = this.advanceSalesTemplate.d14t1;
    }
    this.detailObj.advanceSalesTemplate.d14t2 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d14t2)) {
      this.detailObj.advanceSalesTemplate.d14t2 = this.advanceSalesTemplate.d14t2;
    }
    this.detailObj.advanceSalesTemplate.d14t3 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d14t3)) {
      this.detailObj.advanceSalesTemplate.d14t3 = this.advanceSalesTemplate.d14t3;
    }


    // 第15条
    this.detailObj.advanceSalesTemplate.d15t1 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d15t1)) {
      this.detailObj.advanceSalesTemplate.d15t1 = this.advanceSalesTemplate.d15t1;
    }
    this.detailObj.advanceSalesTemplate.d15t2 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d15t2)) {
      this.detailObj.advanceSalesTemplate.d15t2 = this.advanceSalesTemplate.d15t2;
    }
    this.detailObj.advanceSalesTemplate.d15t3 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d15t3)) {
      this.detailObj.advanceSalesTemplate.d15t3 = this.advanceSalesTemplate.d15t3;
    }
    this.detailObj.advanceSalesTemplate.d15t4 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d15t4)) {
      this.detailObj.advanceSalesTemplate.d15t4 = this.advanceSalesTemplate.d15t4;
    }
    this.detailObj.advanceSalesTemplate.d15t5 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d15t5)) {
      this.detailObj.advanceSalesTemplate.d15t5 = this.advanceSalesTemplate.d15t5;
    }
    this.detailObj.advanceSalesTemplate.d15t6 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d15t6)) {
      this.detailObj.advanceSalesTemplate.d15t6 = this.advanceSalesTemplate.d15t6;
    }


    // 第16条
    this.detailObj.advanceSalesTemplate.d16t1 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d16t1)) {
      this.detailObj.advanceSalesTemplate.d16t1 = this.advanceSalesTemplate.d16t1;
    }
    this.detailObj.advanceSalesTemplate.d16t2 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d16t2)) {
      this.detailObj.advanceSalesTemplate.d16t2 = this.advanceSalesTemplate.d16t2;
    }
    this.detailObj.advanceSalesTemplate.d16t3 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d16t3)) {
      this.detailObj.advanceSalesTemplate.d16t3 = this.advanceSalesTemplate.d16t3;
    }
    this.detailObj.advanceSalesTemplate.d16t4 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d16t4)) {
      this.detailObj.advanceSalesTemplate.d16t4 = this.advanceSalesTemplate.d16t4;
    }
    this.detailObj.advanceSalesTemplate.d16t5 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d16t5)) {
      this.detailObj.advanceSalesTemplate.d16t5 = this.advanceSalesTemplate.d16t5;
    }
    this.detailObj.advanceSalesTemplate.d16t6 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d16t6)) {
      this.detailObj.advanceSalesTemplate.d16t6 = this.advanceSalesTemplate.d16t6;
    }
    this.detailObj.advanceSalesTemplate.d16t7 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d16t7)) {
      this.detailObj.advanceSalesTemplate.d16t7 = this.advanceSalesTemplate.d16t7;
    }
    this.detailObj.advanceSalesTemplate.d16t8 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d16t8)) {
      this.detailObj.advanceSalesTemplate.d16t8 = this.advanceSalesTemplate.d16t8;
    }
    this.detailObj.advanceSalesTemplate.d16t9 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d16t9)) {
      this.detailObj.advanceSalesTemplate.d16t9 = this.advanceSalesTemplate.d16t9;
    }
    this.detailObj.advanceSalesTemplate.d16t10 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d16t10)) {
      this.detailObj.advanceSalesTemplate.d16t10 = this.advanceSalesTemplate.d16t10;
    }
    this.detailObj.advanceSalesTemplate.d16t11 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d16t11)) {
      this.detailObj.advanceSalesTemplate.d16t11 = this.advanceSalesTemplate.d16t11;
    }
    this.detailObj.advanceSalesTemplate.d16t12 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d16t12)) {
      this.detailObj.advanceSalesTemplate.d16t12 = this.advanceSalesTemplate.d16t12;
    }
    this.detailObj.advanceSalesTemplate.d16t13 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d16t13)) {
      this.detailObj.advanceSalesTemplate.d16t13 = this.advanceSalesTemplate.d16t13;
    }
    this.detailObj.advanceSalesTemplate.d16t14 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d16t14)) {
      this.detailObj.advanceSalesTemplate.d16t14 = this.advanceSalesTemplate.d16t14;
    }
    this.detailObj.advanceSalesTemplate.d16t15 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d16t15)) {
      this.detailObj.advanceSalesTemplate.d16t15 = this.advanceSalesTemplate.d16t15;
    }



    // 第17条
    this.detailObj.advanceSalesTemplate.d17t1 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d17t1)) {
      this.detailObj.advanceSalesTemplate.d17t1 = this.advanceSalesTemplate.d17t1;
    }
    this.detailObj.advanceSalesTemplate.d17t2 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d17t2)) {
      this.detailObj.advanceSalesTemplate.d17t2 = this.advanceSalesTemplate.d17t2;
    }


    // 第18条
    this.detailObj.advanceSalesTemplate.d18t1 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d18t1)) {
      this.detailObj.advanceSalesTemplate.d18t1 = this.advanceSalesTemplate.d18t1;
    }



    // 第19条
    this.detailObj.advanceSalesTemplate.d19t1 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d19t1)) {
      this.detailObj.advanceSalesTemplate.d19t1 = this.advanceSalesTemplate.d19t1;
    }
    this.detailObj.advanceSalesTemplate.d19t2 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d19t2)) {
      this.detailObj.advanceSalesTemplate.d19t2 = this.advanceSalesTemplate.d19t2;
    }
    this.detailObj.advanceSalesTemplate.d19t3 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d19t3)) {
      this.detailObj.advanceSalesTemplate.d19t3 = this.advanceSalesTemplate.d19t3;
    }

    // 第20条
    this.detailObj.advanceSalesTemplate.d20t1 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d20t1)) {
      this.detailObj.advanceSalesTemplate.d20t1 = this.advanceSalesTemplate.d20t1;
    }
    this.detailObj.advanceSalesTemplate.d20t2 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d20t2)) {
      this.detailObj.advanceSalesTemplate.d20t2 = this.advanceSalesTemplate.d20t2;
    }
    this.detailObj.advanceSalesTemplate.d20t3 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d20t3)) {
      this.detailObj.advanceSalesTemplate.d20t3 = this.advanceSalesTemplate.d20t3;
    }
    this.detailObj.advanceSalesTemplate.d20t4 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d20t4)) {
      this.detailObj.advanceSalesTemplate.d20t4 = this.advanceSalesTemplate.d20t4;
    }
    this.detailObj.advanceSalesTemplate.d20t5 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d20t5)) {
      this.detailObj.advanceSalesTemplate.d20t5 = this.advanceSalesTemplate.d20t5;
    }


    // 第21条
    this.detailObj.advanceSalesTemplate.d21t1 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d21t1)) {
      this.detailObj.advanceSalesTemplate.d21t1 = this.advanceSalesTemplate.d21t1;
    }
    // this.detailObj.advanceSalesTemplate.d21t2 = '';
    // if (!this.isEmpty(this.advanceSalesTemplate.d21t2)) {
    this.detailObj.advanceSalesTemplate.d21t2 = this.advanceSalesTemplate.d21t2;
    // }
    // this.detailObj.advanceSalesTemplate.d21t3 = '';
    // if (!this.isEmpty(this.advanceSalesTemplate.d21t3)) {
    this.detailObj.advanceSalesTemplate.d21t3 = this.advanceSalesTemplate.d21t3;
    // }
    this.detailObj.advanceSalesTemplate.d21t4 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d21t4)) {
      this.detailObj.advanceSalesTemplate.d21t4 = this.advanceSalesTemplate.d21t4;
    }
    this.detailObj.advanceSalesTemplate.d21t5 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d21t5)) {
      this.detailObj.advanceSalesTemplate.d21t5 = this.advanceSalesTemplate.d21t5;
    }


    // 第22条
    this.detailObj.advanceSalesTemplate.d22t1 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d22t1)) {
      this.detailObj.advanceSalesTemplate.d22t1 = this.advanceSalesTemplate.d22t1;
    }
    this.detailObj.advanceSalesTemplate.d22t2 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d22t2)) {
      this.detailObj.advanceSalesTemplate.d22t2 = this.advanceSalesTemplate.d22t2;
    }
    this.detailObj.advanceSalesTemplate.d22t3 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d22t3)) {
      this.detailObj.advanceSalesTemplate.d22t3 = this.advanceSalesTemplate.d22t3;
    }
    this.detailObj.advanceSalesTemplate.d22t4 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d22t4)) {
      this.detailObj.advanceSalesTemplate.d22t4 = this.advanceSalesTemplate.d22t4;
    }


    // 第23条
    this.detailObj.advanceSalesTemplate.d23t1 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d23t1)) {
      this.detailObj.advanceSalesTemplate.d23t1 = this.advanceSalesTemplate.d23t1;
    }


    // 第24条
    this.detailObj.advanceSalesTemplate.d24t1 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d24t1)) {
      this.detailObj.advanceSalesTemplate.d24t1 = this.advanceSalesTemplate.d24t1;
    }
    this.detailObj.advanceSalesTemplate.d24t2 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d24t2)) {
      this.detailObj.advanceSalesTemplate.d24t2 = this.advanceSalesTemplate.d24t2;
    }

    // 第25条
    this.detailObj.advanceSalesTemplate.d25t1 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d25t1)) {
      this.detailObj.advanceSalesTemplate.d25t1 = this.advanceSalesTemplate.d25t1;
    }
    this.detailObj.advanceSalesTemplate.d25t2 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d25t2)) {
      this.detailObj.advanceSalesTemplate.d25t2 = this.advanceSalesTemplate.d25t2;
    }

    // 第27条
    this.detailObj.advanceSalesTemplate.d27t1 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d27t1)) {
      this.detailObj.advanceSalesTemplate.d27t1 = this.advanceSalesTemplate.d27t1;
    }
    this.detailObj.advanceSalesTemplate.d27t2 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d27t2)) {
      this.detailObj.advanceSalesTemplate.d27t2 = this.advanceSalesTemplate.d27t2;
    }



    // 第29条
    this.detailObj.advanceSalesTemplate.d29t1 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d29t1)) {
      this.detailObj.advanceSalesTemplate.d29t1 = this.advanceSalesTemplate.d29t1;
    }
    this.detailObj.advanceSalesTemplate.d29t2 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d29t2)) {
      this.detailObj.advanceSalesTemplate.d29t2 = this.advanceSalesTemplate.d29t2;
    }
    this.detailObj.advanceSalesTemplate.d29t3 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d29t3)) {
      this.detailObj.advanceSalesTemplate.d29t3 = this.advanceSalesTemplate.d29t3;
    }
    this.detailObj.advanceSalesTemplate.d29t4 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d29t4)) {
      this.detailObj.advanceSalesTemplate.d29t4 = this.advanceSalesTemplate.d29t4;
    }
    this.detailObj.advanceSalesTemplate.d29t5 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d29t5)) {
      this.detailObj.advanceSalesTemplate.d29t5 = this.advanceSalesTemplate.d29t5;
    }
    this.detailObj.advanceSalesTemplate.d29t6 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d29t6)) {
      this.detailObj.advanceSalesTemplate.d29t6 = this.advanceSalesTemplate.d29t6;
    }
    this.detailObj.advanceSalesTemplate.d29t7 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d29t7)) {
      this.detailObj.advanceSalesTemplate.d29t7 = this.advanceSalesTemplate.d29t7;
    }
    this.detailObj.advanceSalesTemplate.d29t8 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.d29t8)) {
      this.detailObj.advanceSalesTemplate.d29t8 = this.advanceSalesTemplate.d29t8;
    }


    // 合同签章
    this.detailObj.advanceSalesTemplate.qz1 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.qz1)) {
      this.detailObj.advanceSalesTemplate.qz1 = this.advanceSalesTemplate.qz1;
    }
    this.detailObj.advanceSalesTemplate.qz2 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.qz2)) {
      this.detailObj.advanceSalesTemplate.qz2 = this.advanceSalesTemplate.qz2;
    }
    this.detailObj.advanceSalesTemplate.qz3 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.qz3)) {
      this.detailObj.advanceSalesTemplate.qz3 = this.advanceSalesTemplate.qz3;
    }
    // this.detailObj.advanceSalesTemplate.qz4 = '';
    // if (!this.isEmpty(this.advanceSalesTemplate.qz4)) {
    this.detailObj.advanceSalesTemplate.qz4 = this.advanceSalesTemplate.qz4;
    // }
    this.detailObj.advanceSalesTemplate.qz5 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.qz5)) {
      this.detailObj.advanceSalesTemplate.qz5 = this.advanceSalesTemplate.qz5;
    }
    this.detailObj.advanceSalesTemplate.qz6 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.qz6)) {
      this.detailObj.advanceSalesTemplate.qz6 = this.advanceSalesTemplate.qz6;
    }
    this.detailObj.advanceSalesTemplate.qz7 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.qz7)) {
      this.detailObj.advanceSalesTemplate.qz7 = this.advanceSalesTemplate.qz7;
    }
    this.detailObj.advanceSalesTemplate.qz8 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.qz8)) {
      this.detailObj.advanceSalesTemplate.qz8 = this.advanceSalesTemplate.qz8;
    }
    this.detailObj.advanceSalesTemplate.qz9 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.qz9)) {
      this.detailObj.advanceSalesTemplate.qz9 = this.advanceSalesTemplate.qz9;
    }
    // this.detailObj.advanceSalesTemplate.qz10 = '';
    // if (!this.isEmpty(this.advanceSalesTemplate.qz10)) {
    this.detailObj.advanceSalesTemplate.qz10 = this.advanceSalesTemplate.qz10;
    // }
    this.detailObj.advanceSalesTemplate.qz11 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.qz11)) {
      this.detailObj.advanceSalesTemplate.qz11 = this.advanceSalesTemplate.qz11;
    }

    // 附件6
    this.detailObj.advanceSalesTemplate.fj6jw1 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.fj6jw1)) {
      this.detailObj.advanceSalesTemplate.fj6jw1 = this.advanceSalesTemplate.fj6jw1;
    }
    this.detailObj.advanceSalesTemplate.fj6jw2 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.fj6jw2)) {
      this.detailObj.advanceSalesTemplate.fj6jw2 = this.advanceSalesTemplate.fj6jw2;
    }
    this.detailObj.advanceSalesTemplate.fj6jw3 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.fj6jw3)) {
      this.detailObj.advanceSalesTemplate.fj6jw3 = this.advanceSalesTemplate.fj6jw3;
    }
    this.detailObj.advanceSalesTemplate.fj6jw4 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.fj6jw4)) {
      this.detailObj.advanceSalesTemplate.fj6jw4 = this.advanceSalesTemplate.fj6jw4;
    }
    this.detailObj.advanceSalesTemplate.fj6jw5 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.fj6jw5)) {
      this.detailObj.advanceSalesTemplate.fj6jw5 = this.advanceSalesTemplate.fj6jw5;
    }
    this.detailObj.advanceSalesTemplate.fj6jw6 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.fj6jw6)) {
      this.detailObj.advanceSalesTemplate.fj6jw6 = this.advanceSalesTemplate.fj6jw6;
    }
    this.detailObj.advanceSalesTemplate.fj6jw7 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.fj6jw7)) {
      this.detailObj.advanceSalesTemplate.fj6jw7 = this.advanceSalesTemplate.fj6jw7;
    }
    this.detailObj.advanceSalesTemplate.fj6jw8 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.fj6jw8)) {
      this.detailObj.advanceSalesTemplate.fj6jw8 = this.advanceSalesTemplate.fj6jw8;
    }
    this.detailObj.advanceSalesTemplate.fj6jw9 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.fj6jw9)) {
      this.detailObj.advanceSalesTemplate.fj6jw9 = this.advanceSalesTemplate.fj6jw9;
    }
    this.detailObj.advanceSalesTemplate.fj6jw10 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.fj6jw10)) {
      this.detailObj.advanceSalesTemplate.fj6jw10 = this.advanceSalesTemplate.fj6jw10;
    }
    this.detailObj.advanceSalesTemplate.fj6jw11 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.fj6jw11)) {
      this.detailObj.advanceSalesTemplate.fj6jw11 = this.advanceSalesTemplate.fj6jw11;
    }
    this.detailObj.advanceSalesTemplate.fj6jw12 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.fj6jw12)) {
      this.detailObj.advanceSalesTemplate.fj6jw12 = this.advanceSalesTemplate.fj6jw12;
    }
    this.detailObj.advanceSalesTemplate.fj6jw13 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.fj6jw13)) {
      this.detailObj.advanceSalesTemplate.fj6jw13 = this.advanceSalesTemplate.fj6jw13;
    }
    this.detailObj.advanceSalesTemplate.fj6jw14 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.fj6jw14)) {
      this.detailObj.advanceSalesTemplate.fj6jw14 = this.advanceSalesTemplate.fj6jw14;
    }
    this.detailObj.advanceSalesTemplate.fj6jw15 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.fj6jw15)) {
      this.detailObj.advanceSalesTemplate.fj6jw15 = this.advanceSalesTemplate.fj6jw15;
    }
    this.detailObj.advanceSalesTemplate.fj6jw16 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.fj6jw16)) {
      this.detailObj.advanceSalesTemplate.fj6jw16 = this.advanceSalesTemplate.fj6jw16;
    }
    this.detailObj.advanceSalesTemplate.fj6jw17 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.fj6jw17)) {
      this.detailObj.advanceSalesTemplate.fj6jw17 = this.advanceSalesTemplate.fj6jw17;
    }
    this.detailObj.advanceSalesTemplate.fj6jw18 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.fj6jw18)) {
      this.detailObj.advanceSalesTemplate.fj6jw18 = this.advanceSalesTemplate.fj6jw18;
    }
    this.detailObj.advanceSalesTemplate.fj6jw19 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.fj6jw19)) {
      this.detailObj.advanceSalesTemplate.fj6jw19 = this.advanceSalesTemplate.fj6jw19;
    }
    this.detailObj.advanceSalesTemplate.fj6jw20 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.fj6jw20)) {
      this.detailObj.advanceSalesTemplate.fj6jw20 = this.advanceSalesTemplate.fj6jw20;
    }
    this.detailObj.advanceSalesTemplate.fj6jw21 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.fj6jw21)) {
      this.detailObj.advanceSalesTemplate.fj6jw21 = this.advanceSalesTemplate.fj6jw21;
    }
    this.detailObj.advanceSalesTemplate.fj6jw22 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.fj6jw22)) {
      this.detailObj.advanceSalesTemplate.fj6jw22 = this.advanceSalesTemplate.fj6jw22;
    }
    this.detailObj.advanceSalesTemplate.fj6jw23 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.fj6jw23)) {
      this.detailObj.advanceSalesTemplate.fj6jw23 = this.advanceSalesTemplate.fj6jw23;
    }
    this.detailObj.advanceSalesTemplate.fj6jw24 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.fj6jw24)) {
      this.detailObj.advanceSalesTemplate.fj6jw24 = this.advanceSalesTemplate.fj6jw24;
    }
    this.detailObj.advanceSalesTemplate.fj6jw25 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.fj6jw25)) {
      this.detailObj.advanceSalesTemplate.fj6jw25 = this.advanceSalesTemplate.fj6jw25;
    }
    this.detailObj.advanceSalesTemplate.fj6jw26 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.fj6jw26)) {
      this.detailObj.advanceSalesTemplate.fj6jw26 = this.advanceSalesTemplate.fj6jw26;
    }
    this.detailObj.advanceSalesTemplate.fj6jw27 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.fj6jw27)) {
      this.detailObj.advanceSalesTemplate.fj6jw27 = this.advanceSalesTemplate.fj6jw27;
    }
    this.detailObj.advanceSalesTemplate.fj6jw28 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.fj6jw28)) {
      this.detailObj.advanceSalesTemplate.fj6jw18 = this.advanceSalesTemplate.fj6jw28;
    }
    this.detailObj.advanceSalesTemplate.fj6jw29 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.fj6jw29)) {
      this.detailObj.advanceSalesTemplate.fj6jw29 = this.advanceSalesTemplate.fj6jw29;
    }
    this.detailObj.advanceSalesTemplate.fj6jw30 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.fj6jw30)) {
      this.detailObj.advanceSalesTemplate.fj6jw30 = this.advanceSalesTemplate.fj6jw30;
    }


    // 附件7
    this.detailObj.advanceSalesTemplate.fj7jw1 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.fj7jw1)) {
      this.detailObj.advanceSalesTemplate.fj7jw1 = this.advanceSalesTemplate.fj7jw1;
    }
    this.detailObj.advanceSalesTemplate.fj7jw2 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.fj7jw2)) {
      this.detailObj.advanceSalesTemplate.fj7jw2 = this.advanceSalesTemplate.fj7jw2;
    }
    this.detailObj.advanceSalesTemplate.fj7jw3 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.fj7jw3)) {
      this.detailObj.advanceSalesTemplate.fj7jw3 = this.advanceSalesTemplate.fj7jw3;
    }
    this.detailObj.advanceSalesTemplate.fj7jw4 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.fj7jw4)) {
      this.detailObj.advanceSalesTemplate.fj7jw4 = this.advanceSalesTemplate.fj7jw4;
    }
    this.detailObj.advanceSalesTemplate.fj7jw5 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.fj7jw5)) {
      this.detailObj.advanceSalesTemplate.fj7jw5 = this.advanceSalesTemplate.fj7jw5;
    }
    this.detailObj.advanceSalesTemplate.fj7jw6 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.fj7jw6)) {
      this.detailObj.advanceSalesTemplate.fj7jw6 = this.advanceSalesTemplate.fj7jw6;
    }
    this.detailObj.advanceSalesTemplate.fj7jw7 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.fj7jw7)) {
      this.detailObj.advanceSalesTemplate.fj7jw7 = this.advanceSalesTemplate.fj7jw7;
    }
    this.detailObj.advanceSalesTemplate.fj7jw8 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.fj7jw8)) {
      this.detailObj.advanceSalesTemplate.fj7jw8 = this.advanceSalesTemplate.fj7jw8;
    }
    this.detailObj.advanceSalesTemplate.fj7jw9 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.fj7jw9)) {
      this.detailObj.advanceSalesTemplate.fj7jw9 = this.advanceSalesTemplate.fj7jw9;
    }
    this.detailObj.advanceSalesTemplate.fj7jw10 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.fj7jw10)) {
      this.detailObj.advanceSalesTemplate.fj7jw10 = this.advanceSalesTemplate.fj7jw10;
    }
    this.detailObj.advanceSalesTemplate.fj7jw11 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.fj7jw11)) {
      this.detailObj.advanceSalesTemplate.fj7jw11 = this.advanceSalesTemplate.fj7jw11;
    }
    this.detailObj.advanceSalesTemplate.fj7jw12 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.fj7jw12)) {
      this.detailObj.advanceSalesTemplate.fj7jw12 = this.advanceSalesTemplate.fj7jw12;
    }
    this.detailObj.advanceSalesTemplate.fj7jw13 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.fj7jw13)) {
      this.detailObj.advanceSalesTemplate.fj7jw13 = this.advanceSalesTemplate.fj7jw13;
    }
    this.detailObj.advanceSalesTemplate.fj7jw14 = '';
    if (!this.isEmpty(this.advanceSalesTemplate.fj7jw14)) {
      this.detailObj.advanceSalesTemplate.fj7jw14 = this.advanceSalesTemplate.fj7jw14;
    }

    // 预售补充20200214
    this.detailObj.advanceSalesTemplate.htmc = '';
    if (!this.isEmpty(this.advanceSalesTemplate.htmc)) {
      this.detailObj.advanceSalesTemplate.htmc = this.advanceSalesTemplate.htmc;
    }
    this.detailObj.advanceSalesTemplate.fh = '';
    if (!this.isEmpty(this.advanceSalesTemplate.fh)) {
      this.detailObj.advanceSalesTemplate.fh = this.advanceSalesTemplate.fh;
    }

    this.detailObj.advanceSalesTemplate.isdbr = 0;
    if (this.advanceSalesTemplate.isdbr == true) {
      this.detailObj.advanceSalesTemplate.isdbr = 1;
    }
    this.detailObj.advanceSalesTemplate.isfzr = 0;
    if (this.advanceSalesTemplate.isfzr == true) {
      this.detailObj.advanceSalesTemplate.isfzr = 1;
    }
    this.detailObj.advanceSalesTemplate.isdbrgj = 0;
    if (this.advanceSalesTemplate.isdbrgj == true) {
      this.detailObj.advanceSalesTemplate.isdbrgj = 1;
    }
    this.detailObj.advanceSalesTemplate.isdbrhj = 0;
    if (this.advanceSalesTemplate.isdbrhj == true) {
      this.detailObj.advanceSalesTemplate.isdbrhj = 1;
    }
    this.detailObj.advanceSalesTemplate.isdbrsfz = 0;
    if (this.advanceSalesTemplate.isdbrsfz == true) {
      this.detailObj.advanceSalesTemplate.isdbrsfz = 1;
    }
    this.detailObj.advanceSalesTemplate.isdbrhz = 0;
    if (this.advanceSalesTemplate.isdbrhz == true) {
      this.detailObj.advanceSalesTemplate.isdbrhz = 1;
    }
    this.detailObj.advanceSalesTemplate.isdbryyzz = 0;
    if (this.advanceSalesTemplate.isdbryyzz == true) {
      this.detailObj.advanceSalesTemplate.isdbryyzz = 1;
    }

    this.detailObj.advanceSalesTemplate.iswtdlr = 0;
    if (this.advanceSalesTemplate.iswtdlr == true) {
      this.detailObj.advanceSalesTemplate.iswtdlr = 1;
    }
    this.detailObj.advanceSalesTemplate.isfddlr = 0;
    if (this.advanceSalesTemplate.isfddlr == true) {
      this.detailObj.advanceSalesTemplate.isfddlr = 1;
    }
    this.detailObj.advanceSalesTemplate.isdlrgj = 0;
    if (this.advanceSalesTemplate.isdlrgj == true) {
      this.detailObj.advanceSalesTemplate.isdlrgj = 1;
    }
    this.detailObj.advanceSalesTemplate.isdlrhj = 0;
    if (this.advanceSalesTemplate.isdlrhj == true) {
      this.detailObj.advanceSalesTemplate.isdlrhj = 1;
    }
    this.detailObj.advanceSalesTemplate.isdlrsfz = 0;
    if (this.advanceSalesTemplate.isdlrsfz == true) {
      this.detailObj.advanceSalesTemplate.isdlrsfz = 1;
    }
    this.detailObj.advanceSalesTemplate.isdlrhz = 0;
    if (this.advanceSalesTemplate.isdlrhz == true) {
      this.detailObj.advanceSalesTemplate.isdlrhz = 1;
    }
    this.detailObj.advanceSalesTemplate.isdlryyzz = 0;
    if (this.advanceSalesTemplate.isdlryyzz == true) {
      this.detailObj.advanceSalesTemplate.isdlryyzz = 1;
    }
    // 第一条
    this.detailObj.advanceSalesTemplate.iscrd1 = 0;
    if (this.advanceSalesTemplate.iscrd1 == true) {
      this.detailObj.advanceSalesTemplate.iscrd1 = 1;
    }
    this.detailObj.advanceSalesTemplate.ishbd1 = 0;
    if (this.advanceSalesTemplate.ishbd1 == true) {
      this.detailObj.advanceSalesTemplate.ishbd1 = 1;
    }

    // 第3条
    this.detailObj.advanceSalesTemplate.iszzd3 = 0;
    if (this.advanceSalesTemplate.iszzd3 == true) {
      this.detailObj.advanceSalesTemplate.iszzd3 = 1;
    }
    this.detailObj.advanceSalesTemplate.isbgd3 = 0;
    if (this.advanceSalesTemplate.isbgd3 == true) {
      this.detailObj.advanceSalesTemplate.isbgd3 = 1;
    }
    this.detailObj.advanceSalesTemplate.issyd3 = 0;
    if (this.advanceSalesTemplate.issyd3 == true) {
      this.detailObj.advanceSalesTemplate.issyd3 = 1;
    }
    this.detailObj.advanceSalesTemplate.isz1d3 = 0;
    if (this.advanceSalesTemplate.isz1d3 == true) {
      this.detailObj.advanceSalesTemplate.isz1d3 = 1;
    }
    this.detailObj.advanceSalesTemplate.isz2d3 = 0;
    if (this.advanceSalesTemplate.isz2d3 == true) {
      this.detailObj.advanceSalesTemplate.isz2d3 = 1;
    }


    // 第4条
    this.detailObj.advanceSalesTemplate.isdyd4 = 0;
    if (this.advanceSalesTemplate.isdyd4 == true) {
      this.detailObj.advanceSalesTemplate.isdyd4 = 1;
    }
    this.detailObj.advanceSalesTemplate.iswdyd4 = 0;
    if (this.advanceSalesTemplate.iswdyd4 == true) {
      this.detailObj.advanceSalesTemplate.iswdyd4 = 1;
    }

    // 第7条
    this.detailObj.advanceSalesTemplate.ishtqdd7 = 0;
    if (this.advanceSalesTemplate.ishtqdd7 == true) {
      this.detailObj.advanceSalesTemplate.ishtqdd7 = 1;
    }
    this.detailObj.advanceSalesTemplate.isjfsfkd7 = 0;
    if (this.advanceSalesTemplate.isjfsfkd7 == true) {
      this.detailObj.advanceSalesTemplate.isjfsfkd7 = 1;
    }
    this.detailObj.advanceSalesTemplate.isdzd7 = 0;
    if (this.advanceSalesTemplate.isdzd7 == true) {
      this.detailObj.advanceSalesTemplate.isdzd7 = 1;
    }
    this.detailObj.advanceSalesTemplate.isgjjdkd7 = 0;
    if (this.advanceSalesTemplate.isgjjdkd7 == true) {
      this.detailObj.advanceSalesTemplate.isgjjdkd7 = 1;
    }
    this.detailObj.advanceSalesTemplate.issydkd7 = 0;
    if (this.advanceSalesTemplate.issydkd7 == true) {
      this.detailObj.advanceSalesTemplate.issydkd7 = 1;
    }

    // 第16条
    this.detailObj.advanceSalesTemplate.isyffkd16 = 0;
    if (this.advanceSalesTemplate.isyffkd16 == true) {
      this.detailObj.advanceSalesTemplate.isyffkd16 = 1;
    }
    this.detailObj.advanceSalesTemplate.isqbssd16 = 0;
    if (this.advanceSalesTemplate.isqbssd16 == true) {
      this.detailObj.advanceSalesTemplate.isqbssd16 = 1;
    }
    this.detailObj.advanceSalesTemplate.isgj1d16 = 0;
    if (this.advanceSalesTemplate.isgj1d16 == true) {
      this.detailObj.advanceSalesTemplate.isgj1d16 = 1;
    }
    this.detailObj.advanceSalesTemplate.isdf1d16 = 0;
    if (this.advanceSalesTemplate.isdf1d16 == true) {
      this.detailObj.advanceSalesTemplate.isdf1d16 = 1;
    }
    this.detailObj.advanceSalesTemplate.isgj2d16 = 0;
    if (this.advanceSalesTemplate.isgj2d16 == true) {
      this.detailObj.advanceSalesTemplate.isgj2d16 = 1;
    }
    this.detailObj.advanceSalesTemplate.isdf2d16 = 0;
    if (this.advanceSalesTemplate.isdf2d16 == true) {
      this.detailObj.advanceSalesTemplate.isdf2d16 = 1;
    }

    // 第19条
    this.detailObj.advanceSalesTemplate.is30tnd19 = 0;
    if (this.advanceSalesTemplate.is30tnd19 == true) {
      this.detailObj.advanceSalesTemplate.is30tnd19 = 1;
    }

    // 第21条
    this.detailObj.advanceSalesTemplate.isbgzd21 = 0;
    if (this.advanceSalesTemplate.isbgzd21 == true) {
      this.detailObj.advanceSalesTemplate.isbgzd21 = 1;
    }
    this.detailObj.advanceSalesTemplate.iscjzd21 = 0;
    if (this.advanceSalesTemplate.iscjzd21 == true) {
      this.detailObj.advanceSalesTemplate.iscjzd21 = 1;
    }

    // 第25条
    this.detailObj.advanceSalesTemplate.iskdd25 = 0;
    if (this.advanceSalesTemplate.iskdd25 == true) {
      this.detailObj.advanceSalesTemplate.iskdd25 = 1;
    }
    this.detailObj.advanceSalesTemplate.isghxd25 = 0;
    if (this.advanceSalesTemplate.isghxd25 == true) {
      this.detailObj.advanceSalesTemplate.isghxd25 = 1;
    }

  }


  // 非空判断
  isEmpty(str) {
    if (str != null && str.length > 0) {
      return false;
    }
    return true;
  }

  calculationHeight() {
    const bodyHeight = $('body').height();
    const height = this.fjList.length * 40;
    if (height > bodyHeight - 440) {
      this.tableIsScroll = { y: bodyHeight - 400 + 'px' };
    } else {
      this.tableIsScroll = null;
    }
  }

  upload() {
    this.isVisible = true;
    this.uploadComponent.fileList = [];
  }

  handleCancel() {
    this.isVisible = false;
    this.uploadComponent.fileList = [];
    this.isOkLoading = false;
  }
  // 开始上传
  handleOk() {
    if (this.isOkLoading) {
      this.msg.error('附件正在上传，请勿重复点击');
      return;
    }
    this.isOkLoading = true;
    this.uploadComponent.import();
  }

  outer(event) {
    if (event) {
      this.isOkLoading = false;
      this.handleCancel();
      this.search();
      this.checkExistCompletionFile();
    }
  }

  async checkExistCompletionFile() {
    const res = await this.houseTradeService.checkExistCompletionFile(
      this.detailObj.id
    );
    if (res && res.code == 200) {
      this.detailObj.houseType = res.msg > 0 ? 1 : 2;
    }
  }

  previewImg(item) {
    if (item.fileSuffix != 'pdf') {
      this.currentImg = this.downLoadurl + '?id=' + item.id + '&type=0';
      this.isImgVisible = true;

      setTimeout(() => {
        const image = new Viewer(document.getElementById('image'), {
          hidden(e) {
            image.destroy();
          }
        });
      }, 200);
    } else {
      window.open(this.downLoadurl + '?id=' + item.id + '&type=0');
    }
  }

  // 删除
  async btachDelete(item?) {
    const ids = [];
    if (item) {
      // 单个删除
      ids.push(item.id);
    } else {
      // 批量删除
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

    const res = await this.fileService.deleteByIds(ids);
    if (res && res.code == 200) {
      this.msg.create('success', '删除成功');
      this.search();
      this.checkExistCompletionFile();
    } else {
      this.msg.create('error', '删除失败');
    }
  }

  // 下载
  btachDown(item?) {
    const ids = [];
    if (item) {
      // 单个
      ids.push(item.id);
    } else {
      // 批量
      if (this.listOfDisplayData.length > 0) {
        this.listOfDisplayData.forEach(element => {
          if (this.mapOfCheckedId[element.id]) {
            ids.push(element.id);
          }
        });
      }
    }

    if (ids.length == 0) {
      this.msg.warning('请选择需要下载的项目');
      return;
    }

    window.location.href = this.downLoadurl + '?id=' + item.id + '&type=0';
  }

  addpeople() {
    if (!this.detailObj.relationShips) {
      this.detailObj.relationShips = [];
    }
    const newpeople = {};
    this.detailObj.relationShips.push(newpeople);
  }

  deletepeople(obj, i) {
    this.detailObj.relationShips.splice(i, 1);
  }

  isbtShow() {
    // console.log(this.detailObj.id.length);
    // if (this.detailObj.id.length > 0) {
    //   this.btShow = true;
    // }
  }
  async wordShow() {
    let url = AppConfig.Configuration.baseUrl + '/HouseTrade/previewHt?id=' + this.detailObj.id;
    url = this.utilitiesSercice.wrapUrl(url);
    window.open('assets/usermanual/web/viewer.html?url=' + url, '_blank');
  }

  houseTypeChange(date) {
    console.log(date);
    if (date == 1) {
      this.isXS = true;
      this.isYS = false;
    }
    if (date == 2) {
      this.isYS = true;
      this.isXS = false;
    }
  }

  nameChange() {
    // if (this.detailObj && this.detailObj.relationShips && this.detailObj.relationShips.length > 0) {
    //   var name = "";
    //   this.detailObj.relationShips.forEach(element => {
    //     name += element.name + ",";
    //   });
    //   this.detailObj.buyer = name.substring(0, name.length - 1);
    // }
  }

  ngAfterViewInit() {
    const that = this;
    $(window).resize(function () {
      that.calculationHeight();
    });
  }


}
