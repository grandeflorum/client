import { Component, OnInit, ViewChildren, QueryList, ViewChild, TemplateRef } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd';
import { Router, ActivatedRoute } from '@angular/router';
import { ValidationDirective } from '../../../../layout/_directives/validation.directive';
import { Localstorage } from '../../../service/localstorage';
import { KfxmglService } from '../../../service/xmgl/kfxmgl.service';
import { FileService } from '../../../service/file/file.service';
import { UtilitiesSercice } from '../../../service/common/utilities.services';
import { LpbglService } from '../../../service/lpbgl/lpbgl.service';
import { StockTradeService } from '../../../service/contract/stock-trade.service';
import * as Moment from 'moment';
import * as $ from 'jquery';
import Viewer from 'viewerjs';


@Component({
  selector: 'app-stock-trade-detail',
  templateUrl: './stock-trade-detail.component.html',
  styleUrls: ['./stock-trade-detail.component.scss']
})
export class StockTradeDetailComponent implements OnInit {

  @ViewChildren(ValidationDirective) directives: QueryList<ValidationDirective>;
  @ViewChild('uploadComponent', { static: false }) uploadComponent;

  downLoadurl = AppConfig.Configuration.baseUrl + '/FileInfo/download';
  tabs = [
    { name: '合同信息', index: 0 },
    { name: '合同委托', index: 1 },
    { name: '买卖合同', index: 2 },
    { name: '附件', index: 3 },
    { name: '关联户信息', index: 4 },
    { name: '关联企业', index: 5 }
  ];

  constructor(
    private msg: NzMessageService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private localstorage: Localstorage,
    private fileService: FileService,
    private utilitiesSercice: UtilitiesSercice,
    private stockTradeService: StockTradeService,
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
    this.bg = this.activatedRoute.snapshot.queryParams.bg;

    this.tabsetIndex = glType ? 4 : 0;

    if (type == 2) {
      this.isDisable = true;
      this.tabs = [
        { name: '合同信息', index: 0 },
        { name: '合同委托', index: 1 },
        { name: '买卖合同', index: 2 },
        { name: '附件', index: 3 },
        { name: '关联企业', index: 4 }
      ];

      this.associatedCompanyShow = true;
    } else if (type == 4) {
      this.tabs.push({ name: '关联户信息', index: 5 });
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
  fileTypeList = [];
  fileTypeIndex = 0;

  rowSpan: any = 0;
  lpbList: any = [];
  selectH: any = '';

  isbusy = false;
  bg = '';

  associatedCompanyShow = false;

  jyDiv = false;
  btShow = false;

  // 甲方集合
  jfList: any = [];
  // 乙方集合
  yfList: any = [];

  // 合同委托模板集合
  contractEntrustment: any = {};

  // 合同模板集合
  stockTradeTemplate: any = {};

  // 房屋转让金额
  fwzrjeqw: any = '';
  fwzrjebw: any = '';
  fwzrjesw: any = '';
  fwzrjew: any = '';
  fwzrjeq: any = '';
  fwzrjeb: any = '';
  fwzrjes: any = '';
  fwzrjey: any = '';

  // 交割房款金额
  jgfkjeqw: any = '';
  jgfkjebw: any = '';
  jgfkjesw: any = '';
  jgfkjew: any = '';
  jgfkjeq: any = '';
  jgfkjeb: any = '';
  jgfkjes: any = '';
  jgfkjey: any = '';

  // 按揭首付款金额
  ajsfkjeqw: any = '';
  ajsfkjebw: any = '';
  ajsfkjesw: any = '';
  ajsfkjew: any = '';
  ajsfkjeq: any = '';
  ajsfkjeb: any = '';
  ajsfkjes: any = '';
  ajsfkjey: any = '';

  // 按揭余付款金额
  ajyfkjeqw: any = '';
  ajyfkjebw: any = '';
  ajyfkjesw: any = '';
  ajyfkjew: any = '';
  ajyfkjeq: any = '';
  ajyfkjeb: any = '';
  ajyfkjes: any = '';
  ajyfkjey: any = '';

  // 一次性付款金额
  ycxfkjeqw: any = '';
  ycxfkjebw: any = '';
  ycxfkjesw: any = '';
  ycxfkjew: any = '';
  ycxfkjeq: any = '';
  ycxfkjeb: any = '';
  ycxfkjes: any = '';
  ycxfkjey: any = '';

  // 分期首付款金额
  fqsfkjeqw: any = '';
  fqsfkjebw: any = '';
  fqsfkjesw: any = '';
  fqsfkjew: any = '';
  fqsfkjeq: any = '';
  fqsfkjeb: any = '';
  fqsfkjes: any = '';
  fqsfkjey: any = '';

  // 分期余付款金额
  fqyfkjeqw: any = '';
  fqyfkjebw: any = '';
  fqyfkjesw: any = '';
  fqyfkjew: any = '';
  fqyfkjeq: any = '';
  fqyfkjeb: any = '';
  fqyfkjes: any = '';
  fqyfkjey: any = '';

  // 按揭托管首付款金额
  ajtgsfkjeqw: any = '';
  ajtgsfkjebw: any = '';
  ajtgsfkjesw: any = '';
  ajtgsfkjew: any = '';
  ajtgsfkjeq: any = '';
  ajtgsfkjeb: any = '';
  ajtgsfkjes: any = '';
  ajtgsfkjey: any = '';

  // 按揭托管余付款金额
  ajtgyfkjeqw: any = '';
  ajtgyfkjebw: any = '';
  ajtgyfkjesw: any = '';
  ajtgyfkjew: any = '';
  ajtgyfkjeq: any = '';
  ajtgyfkjeb: any = '';
  ajtgyfkjes: any = '';
  ajtgyfkjey: any = '';

  // 合同委托金额
  htwtjeqw: any = '';
  htwtjebw: any = '';
  htwtjesw: any = '';
  htwtjew: any = '';
  htwtjeq: any = '';
  htwtjeb: any = '';
  htwtjes: any = '';
  htwtjey: any = '';


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
    let res = await this.stockTradeService.getWFAuditListByProjectid(option);

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



  isOkLoading = false;

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


  // 房屋转让金额转换大写
  async fwzrjeTodx(strNum) {
    if (strNum != undefined || strNum != null) {
      const j = strNum.length;
      for (let i = j; i <= 7; i++) {
        const str = '0';
        strNum = str + strNum;
      }
      // console.log(strNum);
      const chineseMoney = this.toUpperCase(strNum);
      // console.log(chineseMoney);
      for (let i = 0; i <= 7; i++) {

        switch (i) {
          case 0:
            this.fwzrjeqw = chineseMoney.substr(0, 1);
            break;
          case 1:
            this.fwzrjebw = chineseMoney.substr(1, 1);
            break;
          case 2:
            this.fwzrjesw = chineseMoney.substr(2, 1);
            break;
          case 3:
            this.fwzrjew = chineseMoney.substr(3, 1);
            break;
          case 4:
            this.fwzrjeq = chineseMoney.substr(4, 1);
            break;
          case 5:
            this.fwzrjeb = chineseMoney.substr(5, 1);
            break;
          case 6:
            this.fwzrjes = chineseMoney.substr(6, 1);
            break;
          case 7:
            this.fwzrjey = chineseMoney.substr(7, 1);
            break;

        }
      }
    }


  }

  // 交割房款金额转换大写
  async jgfkjeTodx(strNum) {
    if (strNum != undefined || strNum != null) {
      const j = strNum.length;
      for (let i = j; i <= 7; i++) {
        const str = '0';
        strNum = str + strNum;
      }
      // console .log(strNum);
      const chineseMoney = this.toUpperCase(strNum);
      // console .log(chineseMoney);
      for (let i = 0; i <= 7; i++) {

        switch (i) {
          case 0:
            this.jgfkjeqw = chineseMoney.substr(0, 1);
            break;
          case 1:
            this.jgfkjebw = chineseMoney.substr(1, 1);
            break;
          case 2:
            this.jgfkjesw = chineseMoney.substr(2, 1);
            break;
          case 3:
            this.jgfkjew = chineseMoney.substr(3, 1);
            break;
          case 4:
            this.jgfkjeq = chineseMoney.substr(4, 1);
            break;
          case 5:
            this.jgfkjeb = chineseMoney.substr(5, 1);
            break;
          case 6:
            this.jgfkjes = chineseMoney.substr(6, 1);
            break;
          case 7:
            this.jgfkjey = chineseMoney.substr(7, 1);
            break;

        }
      }
    }
  }

  // 按揭首付款金额转换大写
  async ajsfkjeTodx(strNum) {
    if (strNum != undefined || strNum != null) {
      const j = strNum.length;
      for (let i = j; i <= 7; i++) {
        const str = '0';
        strNum = str + strNum;
      }

      const chineseMoney = this.toUpperCase(strNum);
      for (let i = 0; i <= 7; i++) {

        switch (i) {
          case 0:
            this.ajsfkjeqw = chineseMoney.substr(0, 1);
            break;
          case 1:
            this.ajsfkjebw = chineseMoney.substr(1, 1);
            break;
          case 2:
            this.ajsfkjesw = chineseMoney.substr(2, 1);
            break;
          case 3:
            this.ajsfkjew = chineseMoney.substr(3, 1);
            break;
          case 4:
            this.ajsfkjeq = chineseMoney.substr(4, 1);
            break;
          case 5:
            this.ajsfkjeb = chineseMoney.substr(5, 1);
            break;
          case 6:
            this.ajsfkjes = chineseMoney.substr(6, 1);
            break;
          case 7:
            this.ajsfkjey = chineseMoney.substr(7, 1);
            break;

        }
      }
    }
  }

  // 按揭余付款金额
  async ajyfkjeTodx(strNum) {
    if (strNum != undefined || strNum != null) {
      const j = strNum.length;
      for (let i = j; i <= 7; i++) {
        const str = '0';
        strNum = str + strNum;
      }

      const chineseMoney = this.toUpperCase(strNum);
      for (let i = 0; i <= 7; i++) {

        switch (i) {
          case 0:
            this.ajyfkjeqw = chineseMoney.substr(0, 1);
            break;
          case 1:
            this.ajyfkjebw = chineseMoney.substr(1, 1);
            break;
          case 2:
            this.ajyfkjesw = chineseMoney.substr(2, 1);
            break;
          case 3:
            this.ajyfkjew = chineseMoney.substr(3, 1);
            break;
          case 4:
            this.ajyfkjeq = chineseMoney.substr(4, 1);
            break;
          case 5:
            this.ajyfkjeb = chineseMoney.substr(5, 1);
            break;
          case 6:
            this.ajyfkjes = chineseMoney.substr(6, 1);
            break;
          case 7:
            this.ajyfkjey = chineseMoney.substr(7, 1);
            break;

        }
      }
    }
  }

  // 一次性付款金额
  async ycxfkjeTodx(strNum) {
    if (strNum != undefined || strNum != null) {
      const j = strNum.length;
      for (let i = j; i <= 7; i++) {
        const str = '0';
        strNum = str + strNum;
      }

      const chineseMoney = this.toUpperCase(strNum);
      for (let i = 0; i <= 7; i++) {

        switch (i) {
          case 0:
            this.ycxfkjeqw = chineseMoney.substr(0, 1);
            break;
          case 1:
            this.ycxfkjebw = chineseMoney.substr(1, 1);
            break;
          case 2:
            this.ycxfkjesw = chineseMoney.substr(2, 1);
            break;
          case 3:
            this.ycxfkjew = chineseMoney.substr(3, 1);
            break;
          case 4:
            this.ycxfkjeq = chineseMoney.substr(4, 1);
            break;
          case 5:
            this.ycxfkjeb = chineseMoney.substr(5, 1);
            break;
          case 6:
            this.ycxfkjes = chineseMoney.substr(6, 1);
            break;
          case 7:
            this.ycxfkjey = chineseMoney.substr(7, 1);
            break;

        }
      }
    }
  }

  // 分期首付款金额
  async fqsfkjeTodx(strNum) {
    if (strNum != undefined || strNum != null) {
      const j = strNum.length;
      for (let i = j; i <= 7; i++) {
        const str = '0';
        strNum = str + strNum;
      }

      const chineseMoney = this.toUpperCase(strNum);
      for (let i = 0; i <= 7; i++) {

        switch (i) {
          case 0:
            this.fqsfkjeqw = chineseMoney.substr(0, 1);
            break;
          case 1:
            this.fqsfkjebw = chineseMoney.substr(1, 1);
            break;
          case 2:
            this.fqsfkjesw = chineseMoney.substr(2, 1);
            break;
          case 3:
            this.fqsfkjew = chineseMoney.substr(3, 1);
            break;
          case 4:
            this.fqsfkjeq = chineseMoney.substr(4, 1);
            break;
          case 5:
            this.fqsfkjeb = chineseMoney.substr(5, 1);
            break;
          case 6:
            this.fqsfkjes = chineseMoney.substr(6, 1);
            break;
          case 7:
            this.fqsfkjey = chineseMoney.substr(7, 1);
            break;

        }
      }
    }
  }

  // 分期余付款金额
  async fqyfkjeTodx(strNum) {
    if (strNum != undefined || strNum != null) {
      const j = strNum.length;
      for (let i = j; i <= 7; i++) {
        const str = '0';
        strNum = str + strNum;
      }

      const chineseMoney = this.toUpperCase(strNum);
      for (let i = 0; i <= 7; i++) {

        switch (i) {
          case 0:
            this.fqyfkjeqw = chineseMoney.substr(0, 1);
            break;
          case 1:
            this.fqyfkjebw = chineseMoney.substr(1, 1);
            break;
          case 2:
            this.fqyfkjesw = chineseMoney.substr(2, 1);
            break;
          case 3:
            this.fqyfkjew = chineseMoney.substr(3, 1);
            break;
          case 4:
            this.fqyfkjeq = chineseMoney.substr(4, 1);
            break;
          case 5:
            this.fqyfkjeb = chineseMoney.substr(5, 1);
            break;
          case 6:
            this.fqyfkjes = chineseMoney.substr(6, 1);
            break;
          case 7:
            this.fqyfkjey = chineseMoney.substr(7, 1);
            break;

        }
      }
    }
  }

  // 按揭托管首付款金额
  async ajtgsfkjeTodx(strNum) {
    if (strNum != undefined || strNum != null) {
      const j = strNum.length;
      for (let i = j; i <= 7; i++) {
        const str = '0';
        strNum = str + strNum;
      }

      const chineseMoney = this.toUpperCase(strNum);
      for (let i = 0; i <= 7; i++) {

        switch (i) {
          case 0:
            this.ajtgsfkjeqw = chineseMoney.substr(0, 1);
            break;
          case 1:
            this.ajtgsfkjebw = chineseMoney.substr(1, 1);
            break;
          case 2:
            this.ajtgsfkjesw = chineseMoney.substr(2, 1);
            break;
          case 3:
            this.ajtgsfkjew = chineseMoney.substr(3, 1);
            break;
          case 4:
            this.ajtgsfkjeq = chineseMoney.substr(4, 1);
            break;
          case 5:
            this.ajtgsfkjeb = chineseMoney.substr(5, 1);
            break;
          case 6:
            this.ajtgsfkjes = chineseMoney.substr(6, 1);
            break;
          case 7:
            this.ajtgsfkjey = chineseMoney.substr(7, 1);
            break;

        }
      }
    }
  }

  // 按揭托管余付款金额
  async ajtgyfkjeTodx(strNum) {
    if (strNum != undefined || strNum != null) {
      const j = strNum.length;
      for (let i = j; i <= 7; i++) {
        const str = '0';
        strNum = str + strNum;
      }

      const chineseMoney = this.toUpperCase(strNum);
      for (let i = 0; i <= 7; i++) {

        switch (i) {
          case 0:
            this.ajtgyfkjeqw = chineseMoney.substr(0, 1);
            break;
          case 1:
            this.ajtgyfkjebw = chineseMoney.substr(1, 1);
            break;
          case 2:
            this.ajtgyfkjesw = chineseMoney.substr(2, 1);
            break;
          case 3:
            this.ajtgyfkjew = chineseMoney.substr(3, 1);
            break;
          case 4:
            this.ajtgyfkjeq = chineseMoney.substr(4, 1);
            break;
          case 5:
            this.ajtgyfkjeb = chineseMoney.substr(5, 1);
            break;
          case 6:
            this.ajtgyfkjes = chineseMoney.substr(6, 1);
            break;
          case 7:
            this.ajtgyfkjey = chineseMoney.substr(7, 1);
            break;

        }
      }
    }
  }

  // 合同委托付款金额
  async htwtjeTodx(strNum) {
    if (strNum != undefined || strNum != null) {
      const j = strNum.length;
      for (let i = j; i <= 7; i++) {
        const str = '0';
        strNum = str + strNum;
      }

      const chineseMoney = this.toUpperCase(strNum);
      for (let i = 0; i <= 7; i++) {

        switch (i) {
          case 0:
            this.htwtjeqw = chineseMoney.substr(0, 1);
            break;
          case 1:
            this.htwtjebw = chineseMoney.substr(1, 1);
            break;
          case 2:
            this.htwtjesw = chineseMoney.substr(2, 1);
            break;
          case 3:
            this.htwtjew = chineseMoney.substr(3, 1);
            break;
          case 4:
            this.htwtjeq = chineseMoney.substr(4, 1);
            break;
          case 5:
            this.htwtjeb = chineseMoney.substr(5, 1);
            break;
          case 6:
            this.htwtjes = chineseMoney.substr(6, 1);
            break;
          case 7:
            this.htwtjey = chineseMoney.substr(7, 1);
            break;

        }
      }
    }
  }

  // 数字转汉字金额
  toUpperCase(money) {
    const digit = ['零', '壹', '贰', '叁', '肆', '伍', '陆', '柒', '捌', '玖'];
    let chineseNum = '';
    for (let i = 0; i < money.length; i++) {
      const j = parseInt(money.substr(i, 1));
      chineseNum = chineseNum + digit[j];
    }
    return chineseNum;

  }

  async getDetail() {
    const res = await this.stockTradeService.getStockTradeById(this.detailObj.id);
    if (res && res.code == 200) {
      this.detailObj = res.msg;

      // console .log(this.detailObj.stockTradeTemplate , this.detailObj);
      this.contractEntrustment = this.detailObj.contractEntrustment;
      this.stockTradeTemplate = this.detailObj.stockTradeTemplate;

      this.fwzrjeTodx(this.stockTradeTemplate.d2t1);
      this.jgfkjeTodx(this.stockTradeTemplate.d3t2);
      this.ajsfkjeTodx(this.stockTradeTemplate.d3t7);
      this.ajyfkjeTodx(this.stockTradeTemplate.d3t8);
      this.ycxfkjeTodx(this.stockTradeTemplate.d3t14);
      this.fqsfkjeTodx(this.stockTradeTemplate.d3t16);
      this.fqyfkjeTodx(this.stockTradeTemplate.d3t18);
      this.ajtgsfkjeTodx(this.stockTradeTemplate.d3t20);

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

      const jf = this.buildInfoList(this.detailObj.jf);
      const jflxdz = this.buildInfoList(this.detailObj.jflxdz);
      const jfzjlx = this.buildInfoList(this.detailObj.jfzjlx);
      const jfzjhm = this.buildInfoList(this.detailObj.jfzjhm);
      const jflxdh = this.buildInfoList(this.detailObj.jflxdh);
      const jfgyfs = this.buildInfoList(this.detailObj.jfgyfs);
      const jfgybl = this.buildInfoList(this.detailObj.jfgybl);

      this.jfList = [];
      for (let idx = 0; idx < jf.length; idx++) {
        this.jfList.push({
          jf: jf[idx],
          jflxdz: jflxdz[idx],
          jfzjlx: jfzjlx[idx],
          jfzjhm: jfzjhm[idx],
          jflxdh: jflxdh[idx],
          jfgyfs: jfgyfs[idx],
          jfgybl: jfgybl[idx]
        });
      }


      const yf = this.buildInfoList(this.detailObj.yf);
      const yflxdz = this.buildInfoList(this.detailObj.yflxdz);
      const yfzjlx = this.buildInfoList(this.detailObj.yfzjlx);
      const yfzjhm = this.buildInfoList(this.detailObj.yfzjhm);
      const yflxdh = this.buildInfoList(this.detailObj.yflxdh);
      const yfgyfs = this.buildInfoList(this.detailObj.yfgyfs);
      const yfgybl = this.buildInfoList(this.detailObj.yfgybl);

      this.yfList = [];
      for (let idx = 0; idx < yf.length; idx++) {
        this.yfList.push({
          yf: yf[idx],
          yflxdz: yflxdz[idx],
          yfzjlx: yfzjlx[idx],
          yfzjhm: yfzjhm[idx],
          yflxdh: yflxdh[idx],
          yfgyfs: yfgyfs[idx],
          yfgybl: yfgybl[idx]
        });
      }


    } else {
      this.msg.create('error', '内部服务错误');
    }
  }

  buildInfoList(param) {

    let list = [];
    param = param ? param : '';

    if (param.indexOf(',') != -1) {
      list = param.split(',');
    } else {
      list.push(param);
    }

    return list;

  }

  async getHInfo() {
    const res = await this.stockTradeService.getHInfo(this.detailObj.houseId);
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

    const res = await this.stockTradeService.linkH(this.detailObj.id, this.selectH);
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
    const res = await this.fileService.getFileListByRefidAndType(option2);

    if (res.code == 200) {
      this.fjList = res.msg.currentList;
      this.totalCount = res.msg.recordCount;
    }

    this.calculationHeight();
    this.operateData();
  }

  tabsetChange(m) {
    this.tabsetIndex = m;
    console.log(this.tabsetIndex);
  }

  cancel() {
    const route = '/contract/stockTrade';

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
      this.listOfDisplayData.filter(item => !item.disabled).some(item => this.mapOfCheckedId[item.id]) &&
      !this.isAllDisplayDataChecked;
    this.numberOfChecked = this.listOfAllData.filter(item => this.mapOfCheckedId[item.id]).length;

    for (const id in this.mapOfCheckedId) {
      // console .log(id);
    }
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

  async jfChoose() {
    $('#mrjfgx').attr('checked', 'checked');
    // $('input[name=\'sex\'][value=0]').attr('checked', true);
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


  async save() {
    if (!this.FormValidation()) {
      return;
    }
    if (!this.detailObj.id) {
      delete this.detailObj.id;
    }

    // if (this.jfList.length == 0) {
    //   this.msg.create('error', '请填写甲方信息');
    //   return;
    // }

    // if (this.yfList.length == 0) {
    //   this.msg.create('error', '请填写乙方信息');
    //   return;
    // }

    if (this.isbusy) {
      this.msg.create('error', '数据正在保存，请勿重复点击');
      return;
    }
    this.isbusy = true;
    this.detailObj.bg = this.bg;

    this.detailObj.jf = '';
    this.detailObj.jflxdz = '';
    this.detailObj.jfzjlx = '';
    this.detailObj.jfzjhm = '';
    this.detailObj.jflxdh = '';
    this.detailObj.jfgyfs = '';
    this.detailObj.jfgybl = '';


    for (let idx = 0; idx < this.jfList.length; idx++) {

      if (idx != this.jfList.length - 1) {
        this.detailObj.jf += this.jfList[idx].jf + ',';
        this.detailObj.jflxdz += this.jfList[idx].jflxdz + ',';
        this.detailObj.jfzjlx += this.jfList[idx].jfzjlx + ',';
        this.detailObj.jfzjhm += this.jfList[idx].jfzjhm + ',';
        this.detailObj.jflxdh += this.jfList[idx].jflxdh + ',';
        this.detailObj.jfgyfs += this.jfList[idx].jfgyfs + ',';
        this.detailObj.jfgybl += this.jfList[idx].jfgybl + ',';

      } else {
        this.detailObj.jf += this.jfList[idx].jf;
        this.detailObj.jflxdz += this.jfList[idx].jflxdz;
        this.detailObj.jfzjlx += this.jfList[idx].jfzjlx;
        this.detailObj.jfzjhm += this.jfList[idx].jfzjhm;
        this.detailObj.jflxdh += this.jfList[idx].jflxdh;
        this.detailObj.jfgyfs += this.jfList[idx].jfgyfs;
        this.detailObj.jfgybl += this.jfList[idx].jfgybl;
      }

    }

    this.detailObj.yf = '';
    this.detailObj.yflxdz = '';
    this.detailObj.yfzjlx = '';
    this.detailObj.yfzjhm = '';
    this.detailObj.yflxdh = '';
    this.detailObj.yfgyfs = '';
    this.detailObj.yfgybl = '';

    for (let idx = 0; idx < this.yfList.length; idx++) {

      if (idx != this.yfList.length - 1) {
        this.detailObj.yf += this.yfList[idx].yf + ',';
        this.detailObj.yflxdz += this.yfList[idx].yflxdz + ',';
        this.detailObj.yfzjlx += this.yfList[idx].yfzjlx + ',';
        this.detailObj.yfzjhm += this.yfList[idx].yfzjhm + ',';
        this.detailObj.yflxdh += this.yfList[idx].yflxdh + ',';
        this.detailObj.yfgyfs += this.yfList[idx].yfgyfs + ',';
        this.detailObj.yfgybl += this.yfList[idx].yfgybl + ',';
      } else {
        this.detailObj.yf += this.yfList[idx].yf;
        this.detailObj.yflxdz += this.yfList[idx].yflxdz;
        this.detailObj.yfzjlx += this.yfList[idx].yfzjlx;
        this.detailObj.yfzjhm += this.yfList[idx].yfzjhm;
        this.detailObj.yflxdh += this.yfList[idx].yflxdh;
        this.detailObj.yfgyfs += this.yfList[idx].yfgyfs;
        this.detailObj.yfgybl += this.yfList[idx].yfgybl;
      }

    }
    // 合同委托

    this.detailObj.contractEntrustment = {};
    this.detailObj.contractEntrustment.id = '';
    this.detailObj.contractEntrustment.stocktradeid = '';
    // 合同编号
    this.detailObj.contractEntrustment.ht1 = '';
    if (!this.isEmpty(this.contractEntrustment.ht1)) {
      this.detailObj.contractEntrustment.ht1 = this.contractEntrustment.ht1;
    }
    // 甲方
    this.detailObj.contractEntrustment.jf1 = '';
    if (!this.isEmpty(this.contractEntrustment.jf1)) {
      this.detailObj.contractEntrustment.jf1 = this.contractEntrustment.jf1;
    }

    // 甲方勾选项
    this.detailObj.contractEntrustment.isjfsfzzh = 0;
    // console.log(this.contractEntrustment.isjfsfzzh);
    if (this.contractEntrustment.isjfsfzzh == true) {
      this.detailObj.contractEntrustment.isjfsfzzh = 1;
      // console.log(this.detailObj.contractEntrustment.isjfsfzzh);
      // console.log(this.contractEntrustment.isjfsfzzh);
    }

    this.detailObj.contractEntrustment.isjfhzh = 0;
    // console.log(this.contractEntrustment.isjfhzh);
    if (this.contractEntrustment.isjfhzh == true) {
      this.detailObj.contractEntrustment.isjfhzh = 1;
      // console.log(this.detailObj.contractEntrustment.isjfhzh);
      // console.log(this.contractEntrustment.isjfhzh);
    }

    this.detailObj.contractEntrustment.isjfyyzz = 0;
    // console.log(this.contractEntrustment.isjfyyzz);
    if (this.contractEntrustment.isjfyyzz == true) {
      this.detailObj.contractEntrustment.isjfyyzz = 1;
      // console.log(this.detailObj.contractEntrustment.isjfyyzz);
      // console.log(this.contractEntrustment.isjfyyzz);
    }

    this.detailObj.contractEntrustment.jf2 = '';
    if (!this.isEmpty(this.contractEntrustment.jf2)) {
      this.detailObj.contractEntrustment.jf2 = this.contractEntrustment.jf2;
    }
    this.detailObj.contractEntrustment.jf3 = '';
    if (!this.isEmpty(this.contractEntrustment.jf3)) {
      this.detailObj.contractEntrustment.jf3 = this.contractEntrustment.jf3;
    }
    this.detailObj.contractEntrustment.jf4 = '';
    if (!this.isEmpty(this.contractEntrustment.jf4)) {
      this.detailObj.contractEntrustment.jf4 = this.contractEntrustment.jf4;
    }
    this.detailObj.contractEntrustment.jf5 = '';
    if (!this.isEmpty(this.contractEntrustment.jf5)) {
      this.detailObj.contractEntrustment.jf5 = this.contractEntrustment.jf5;
    }
    this.detailObj.contractEntrustment.jf6 = '';
    if (!this.isEmpty(this.contractEntrustment.jf6)) {
      this.detailObj.contractEntrustment.jf6 = this.contractEntrustment.jf6;
    }
    this.detailObj.contractEntrustment.jf7 = '';
    if (!this.isEmpty(this.contractEntrustment.jf7)) {
      this.detailObj.contractEntrustment.jf7 = this.contractEntrustment.jf7;
    }
    this.detailObj.contractEntrustment.jf8 = '';
    if (!this.isEmpty(this.contractEntrustment.jf8)) {
      this.detailObj.contractEntrustment.jf8 = this.contractEntrustment.jf8;
    }
    this.detailObj.contractEntrustment.jf9 = '';
    if (!this.isEmpty(this.contractEntrustment.jf9)) {
      this.detailObj.contractEntrustment.jf9 = this.contractEntrustment.jf9;
    }

    // 乙方
    this.detailObj.contractEntrustment.yf1 = '';
    if (!this.isEmpty(this.contractEntrustment.yf1)) {
      this.detailObj.contractEntrustment.yf1 = this.contractEntrustment.yf1;
    }

    // 乙方勾选项
    this.detailObj.contractEntrustment.isyfsfzzh = 0;
    if (this.contractEntrustment.isyfsfzzh == true) {
      this.detailObj.contractEntrustment.isyfsfzzh = 1;
    }

    this.detailObj.contractEntrustment.isyfhzh = 0;
    if (this.contractEntrustment.isyfhzh == true) {
      this.detailObj.contractEntrustment.isyfhzh = 1;
    }

    this.detailObj.contractEntrustment.isyfyyzz = 0;
    // console.log(this.contractEntrustment.isyfyyzz);
    if (this.contractEntrustment.isyfyyzz == true) {
      this.detailObj.contractEntrustment.isyfyyzz = 1;
      // console.log(this.detailObj.contractEntrustment.isyfyyzz);
      // console.log(this.contractEntrustment.isyfyyzz);
    }

    this.detailObj.contractEntrustment.yf2 = '';
    if (!this.isEmpty(this.contractEntrustment.yf2)) {
      this.detailObj.contractEntrustment.yf2 = this.contractEntrustment.yf2;
    }
    this.detailObj.contractEntrustment.yf3 = '';
    if (!this.isEmpty(this.contractEntrustment.yf3)) {
      this.detailObj.contractEntrustment.yf3 = this.contractEntrustment.yf3;
    }
    this.detailObj.contractEntrustment.yf4 = '';
    if (!this.isEmpty(this.contractEntrustment.yf4)) {
      this.detailObj.contractEntrustment.yf4 = this.contractEntrustment.yf4;
    }
    this.detailObj.contractEntrustment.yf5 = '';
    if (!this.isEmpty(this.contractEntrustment.yf5)) {
      this.detailObj.contractEntrustment.yf5 = this.contractEntrustment.yf5;
    }
    this.detailObj.contractEntrustment.yf6 = '';
    if (!this.isEmpty(this.contractEntrustment.yf6)) {
      this.detailObj.contractEntrustment.yf6 = this.contractEntrustment.yf6;
    }
    this.detailObj.contractEntrustment.yf7 = '';
    if (!this.isEmpty(this.contractEntrustment.yf7)) {
      this.detailObj.contractEntrustment.yf7 = this.contractEntrustment.yf7;
    }
    this.detailObj.contractEntrustment.yf8 = '';
    if (!this.isEmpty(this.contractEntrustment.yf8)) {
      this.detailObj.contractEntrustment.yf8 = this.contractEntrustment.yf8;
    }
    this.detailObj.contractEntrustment.yf9 = '';
    if (!this.isEmpty(this.contractEntrustment.yf9)) {
      this.detailObj.contractEntrustment.yf9 = this.contractEntrustment.yf9;
    }

    // 第一条
    this.detailObj.contractEntrustment.d1t1 = '';
    if (!this.isEmpty(this.contractEntrustment.d1t1)) {
      this.detailObj.contractEntrustment.d1t1 = this.contractEntrustment.d1t1;
    }

    // 第二条
    this.detailObj.contractEntrustment.d2t1 = '';
    if (!this.isEmpty(this.contractEntrustment.d2t1)) {
      this.detailObj.contractEntrustment.d2t1 = this.contractEntrustment.d2t1;
    }

    // 第三条
    this.detailObj.contractEntrustment.d3t1 = '';
    if (!this.isEmpty(this.contractEntrustment.d3t1)) {
      this.detailObj.contractEntrustment.d3t1 = this.contractEntrustment.d3t1;
    }
    this.detailObj.contractEntrustment.d3t2 = '';
    if (!this.isEmpty(this.contractEntrustment.d3t2)) {
      this.detailObj.contractEntrustment.d3t2 = this.contractEntrustment.d3t2;
    }

    // 第四条
    this.detailObj.contractEntrustment.d4t1 = this.contractEntrustment.d4t1;
    this.detailObj.contractEntrustment.d4t2 = this.contractEntrustment.d4t2;
    // 勾选部分
    this.detailObj.contractEntrustment.iscs = 0;
    if (this.contractEntrustment.iscs == true) {
      this.detailObj.contractEntrustment.iscs = 1;
    }
    this.detailObj.contractEntrustment.iscz = 0;
    if (this.contractEntrustment.iscz == true) {
      this.detailObj.contractEntrustment.iscz = 1;
    }
    this.detailObj.contractEntrustment.iscg = 0;
    if (this.contractEntrustment.iscg == true) {
      this.detailObj.contractEntrustment.iscg = 1;
    }
    this.detailObj.contractEntrustment.iscz1 = 0;
    if (this.contractEntrustment.iscz1 == true) {
      this.detailObj.contractEntrustment.iscz1 = 1;
    }
    this.detailObj.contractEntrustment.iszh = 0;
    if (this.contractEntrustment.iszh == true) {
      this.detailObj.contractEntrustment.iszh = 1;
    }

    // 第六条
    this.detailObj.contractEntrustment.d6t1 = '';
    if (!this.isEmpty(this.contractEntrustment.d6t1)) {
      this.detailObj.contractEntrustment.d6t1 = this.contractEntrustment.d6t1;
    }
    this.detailObj.contractEntrustment.d6t2 = '';
    if (!this.isEmpty(this.contractEntrustment.d6t2)) {
      this.detailObj.contractEntrustment.d6t2 = this.contractEntrustment.d6t2;
    }
    this.detailObj.contractEntrustment.d6t3 = '';
    if (!this.isEmpty(this.contractEntrustment.d6t3)) {
      this.detailObj.contractEntrustment.d6t3 = this.contractEntrustment.d6t3;
    }
    this.detailObj.contractEntrustment.d6t4 = '';
    if (!this.isEmpty(this.contractEntrustment.d6t4)) {
      this.detailObj.contractEntrustment.d6t4 = this.contractEntrustment.d6t4;
    }
    this.detailObj.contractEntrustment.d6t5 = '';
    if (!this.isEmpty(this.contractEntrustment.d6t5)) {
      this.detailObj.contractEntrustment.d6t5 = this.contractEntrustment.d6t5;
    }

    // 第九条
    this.detailObj.contractEntrustment.d9t1 = '';
    if (!this.isEmpty(this.contractEntrustment.d9t1)) {
      this.detailObj.contractEntrustment.d9t1 = this.contractEntrustment.d9t1;
    }
    this.detailObj.contractEntrustment.d9t2 = '';
    if (!this.isEmpty(this.contractEntrustment.d9t2)) {
      this.detailObj.contractEntrustment.d9t2 = this.contractEntrustment.d9t2;
    }

    // 第十二条
    this.detailObj.contractEntrustment.d12t1 = '';
    if (!this.isEmpty(this.contractEntrustment.d12t1)) {
      this.detailObj.contractEntrustment.d12t1 = this.contractEntrustment.d12t1;
    }

    // 签章
    this.detailObj.contractEntrustment.qz1 = '';
    if (!this.isEmpty(this.contractEntrustment.qz1)) {
      this.detailObj.contractEntrustment.qz1 = this.contractEntrustment.qz1;
    }
    this.detailObj.contractEntrustment.qz2 = '';
    if (!this.isEmpty(this.contractEntrustment.qz2)) {
      this.detailObj.contractEntrustment.qz2 = this.contractEntrustment.qz2;
    }
    this.detailObj.contractEntrustment.qz3 = '';
    if (!this.isEmpty(this.contractEntrustment.qz3)) {
      this.detailObj.contractEntrustment.qz3 = this.contractEntrustment.qz3;
    }
    this.detailObj.contractEntrustment.qz4 = '';
    if (!this.isEmpty(this.contractEntrustment.qz4)) {
      this.detailObj.contractEntrustment.qz4 = this.contractEntrustment.qz4;
    }

    this.detailObj.contractEntrustment.qz5 = this.contractEntrustment.qz5;

    // this.detailObj.contractEntrustment.qz5 = '';
    // if (!this.isEmpty(this.contractEntrustment.qz5)) {
    //   this.detailObj.contractEntrustment.qz5 = this.contractEntrustment.qz5;
    // }
    this.detailObj.contractEntrustment.qz6 = '';
    if (!this.isEmpty(this.contractEntrustment.qz6)) {
      this.detailObj.contractEntrustment.qz6 = this.contractEntrustment.qz6;
    }
    this.detailObj.contractEntrustment.qz7 = '';
    if (!this.isEmpty(this.contractEntrustment.qz7)) {
      this.detailObj.contractEntrustment.qz7 = this.contractEntrustment.qz7;
    }
    this.detailObj.contractEntrustment.qz8 = '';
    if (!this.isEmpty(this.contractEntrustment.qz8)) {
      this.detailObj.contractEntrustment.qz8 = this.contractEntrustment.qz8;
    }
    this.detailObj.contractEntrustment.qz9 = this.contractEntrustment.qz9;

    // 附件1
    this.detailObj.contractEntrustment.fj1jw1 = '';
    if (!this.isEmpty(this.contractEntrustment.fj1jw1)) {
      this.detailObj.contractEntrustment.fj1jw1 = this.contractEntrustment.fj1jw1;
    }
    this.detailObj.contractEntrustment.fj1jw2 = '';
    if (!this.isEmpty(this.contractEntrustment.fj1jw2)) {
      this.detailObj.contractEntrustment.fj1jw2 = this.contractEntrustment.fj1jw2;
    }
    this.detailObj.contractEntrustment.fj1jw3 = '';
    if (!this.isEmpty(this.contractEntrustment.fj1jw3)) {
      this.detailObj.contractEntrustment.fj1jw3 = this.contractEntrustment.fj1jw3;
    }
    this.detailObj.contractEntrustment.fj1jw4 = '';
    if (!this.isEmpty(this.contractEntrustment.fj1jw4)) {
      this.detailObj.contractEntrustment.fj1jw4 = this.contractEntrustment.fj1jw4;
    }
    this.detailObj.contractEntrustment.fj1jw5 = '';
    if (!this.isEmpty(this.contractEntrustment.fj1jw5)) {
      this.detailObj.contractEntrustment.fj1jw5 = this.contractEntrustment.fj1jw5;
    }
    this.detailObj.contractEntrustment.fj1jw6 = '';
    if (!this.isEmpty(this.contractEntrustment.fj1jw6)) {
      this.detailObj.contractEntrustment.fj1jw6 = this.contractEntrustment.fj1jw6;
    }
    this.detailObj.contractEntrustment.fj1jw7 = '';
    if (!this.isEmpty(this.contractEntrustment.fj1jw7)) {
      this.detailObj.contractEntrustment.fj1jw7 = this.contractEntrustment.fj1jw7;
    }
    this.detailObj.contractEntrustment.fj1jw8 = '';
    if (!this.isEmpty(this.contractEntrustment.fj1jw8)) {
      this.detailObj.contractEntrustment.fj1jw8 = this.contractEntrustment.fj1jw8;
    }
    this.detailObj.contractEntrustment.fj1jw9 = '';
    if (!this.isEmpty(this.contractEntrustment.fj1jw9)) {
      this.detailObj.contractEntrustment.fj1jw9 = this.contractEntrustment.fj1jw9;
    }
    this.detailObj.contractEntrustment.fj1jw10 = '';
    if (!this.isEmpty(this.contractEntrustment.fj1jw10)) {
      this.detailObj.contractEntrustment.fj1jw10 = this.contractEntrustment.fj1jw10;
    }
    this.detailObj.contractEntrustment.fj1jw11 = '';
    if (!this.isEmpty(this.contractEntrustment.fj1jw11)) {
      this.detailObj.contractEntrustment.fj1jw11 = this.contractEntrustment.fj1jw11;
    }
    this.detailObj.contractEntrustment.fj1jw12 = '';
    if (!this.isEmpty(this.contractEntrustment.fj1jw12)) {
      this.detailObj.contractEntrustment.fj1jw12 = this.contractEntrustment.fj1jw12;
    }
    this.detailObj.contractEntrustment.fj1jw13 = '';
    if (!this.isEmpty(this.contractEntrustment.fj1jw13)) {
      this.detailObj.contractEntrustment.fj1jw13 = this.contractEntrustment.fj1jw13;
    }
    this.detailObj.contractEntrustment.fj1jw14 = '';
    if (!this.isEmpty(this.contractEntrustment.fj1jw14)) {
      this.detailObj.contractEntrustment.fj1jw14 = this.contractEntrustment.fj1jw14;
    }
    this.detailObj.contractEntrustment.fj1jw15 = '';
    if (!this.isEmpty(this.contractEntrustment.fj1jw15)) {
      this.detailObj.contractEntrustment.fj1jw15 = this.contractEntrustment.fj1jw15;
    }
    this.detailObj.contractEntrustment.fj1jw16 = '';
    if (!this.isEmpty(this.contractEntrustment.fj1jw16)) {
      this.detailObj.contractEntrustment.fj1jw16 = this.contractEntrustment.fj1jw16;
    }
    this.detailObj.contractEntrustment.fj1jw17 = '';
    if (!this.isEmpty(this.contractEntrustment.fj1jw17)) {
      this.detailObj.contractEntrustment.fj1jw17 = this.contractEntrustment.fj1jw17;
    }
    this.detailObj.contractEntrustment.fj1jw18 = '';
    if (!this.isEmpty(this.contractEntrustment.fj1jw18)) {
      this.detailObj.contractEntrustment.fj1jw18 = this.contractEntrustment.fj1jw18;
    }


    // 合同买卖部分
    this.detailObj.stockTradeTemplate = {};
    this.detailObj.stockTradeTemplate.id = '';
    this.detailObj.stockTradeTemplate.stocktradeid = '';
    this.detailObj.stockTradeTemplate.ht1 = '';
    if (!this.isEmpty(this.stockTradeTemplate.ht1)) {
      this.detailObj.stockTradeTemplate.ht1 = this.stockTradeTemplate.ht1;
    }
    this.detailObj.stockTradeTemplate.ht2 = '';
    if (!this.isEmpty(this.stockTradeTemplate.ht2)) {
      this.detailObj.stockTradeTemplate.ht2 = this.stockTradeTemplate.ht2;
    }
    this.detailObj.stockTradeTemplate.ht3 = '';
    if (!this.isEmpty(this.stockTradeTemplate.ht3)) {
      this.detailObj.stockTradeTemplate.ht3 = this.stockTradeTemplate.ht3;
    }

    this.detailObj.stockTradeTemplate.jf1 = '';
    if (!this.isEmpty(this.stockTradeTemplate.jf1)) {
      this.detailObj.stockTradeTemplate.jf1 = this.stockTradeTemplate.jf1;
    }
    this.detailObj.stockTradeTemplate.jf2 = '';
    if (!this.isEmpty(this.stockTradeTemplate.jf2)) {
      this.detailObj.stockTradeTemplate.jf2 = this.stockTradeTemplate.jf2;
    }
    this.detailObj.stockTradeTemplate.jf3 = '';
    if (!this.isEmpty(this.stockTradeTemplate.jf3)) {
      this.detailObj.stockTradeTemplate.jf3 = this.stockTradeTemplate.jf3;
    }
    this.detailObj.stockTradeTemplate.jf4 = '';
    if (!this.isEmpty(this.stockTradeTemplate.jf4)) {
      this.detailObj.stockTradeTemplate.jf4 = this.stockTradeTemplate.jf4;
    }
    this.detailObj.stockTradeTemplate.jf5 = '';
    if (!this.isEmpty(this.stockTradeTemplate.jf5)) {
      this.detailObj.stockTradeTemplate.jf5 = this.stockTradeTemplate.jf5;
    }
    this.detailObj.stockTradeTemplate.jf6 = '';
    if (!this.isEmpty(this.stockTradeTemplate.jf6)) {
      this.detailObj.stockTradeTemplate.jf6 = this.stockTradeTemplate.jf6;
    }
    this.detailObj.stockTradeTemplate.jf7 = '';
    if (!this.isEmpty(this.stockTradeTemplate.jf7)) {
      this.detailObj.stockTradeTemplate.jf7 = this.stockTradeTemplate.jf7;
    }
    this.detailObj.stockTradeTemplate.jf8 = '';
    if (!this.isEmpty(this.stockTradeTemplate.jf8)) {
      this.detailObj.stockTradeTemplate.jf8 = this.stockTradeTemplate.jf8;
    }
    this.detailObj.stockTradeTemplate.jf9 = '';
    if (!this.isEmpty(this.stockTradeTemplate.jf9)) {
      this.detailObj.stockTradeTemplate.jf9 = this.stockTradeTemplate.jf9;
    }
    this.detailObj.stockTradeTemplate.jf10 = '';
    if (!this.isEmpty(this.stockTradeTemplate.jf10)) {
      this.detailObj.stockTradeTemplate.jf10 = this.stockTradeTemplate.jf10;
    }
    this.detailObj.stockTradeTemplate.jf11 = '';
    if (!this.isEmpty(this.stockTradeTemplate.jf11)) {
      this.detailObj.stockTradeTemplate.jf11 = this.stockTradeTemplate.jf11;
    }
    this.detailObj.stockTradeTemplate.jf12 = '';
    if (!this.isEmpty(this.stockTradeTemplate.jf12)) {
      this.detailObj.stockTradeTemplate.jf12 = this.stockTradeTemplate.jf12;
    }
    this.detailObj.stockTradeTemplate.jf13 = '';
    if (!this.isEmpty(this.stockTradeTemplate.jf13)) {
      this.detailObj.stockTradeTemplate.jf13 = this.stockTradeTemplate.jf13;
    }
    this.detailObj.stockTradeTemplate.jf14 = '';
    if (!this.isEmpty(this.stockTradeTemplate.jf14)) {
      this.detailObj.stockTradeTemplate.jf14 = this.stockTradeTemplate.jf14;
    }
    this.detailObj.stockTradeTemplate.jf15 = '';
    if (!this.isEmpty(this.stockTradeTemplate.jf15)) {
      this.detailObj.stockTradeTemplate.jf15 = this.stockTradeTemplate.jf15;
    }
    this.detailObj.stockTradeTemplate.jf16 = '';
    if (!this.isEmpty(this.stockTradeTemplate.jf16)) {
      this.detailObj.stockTradeTemplate.jf16 = this.stockTradeTemplate.jf16;
    }
    this.detailObj.stockTradeTemplate.jf17 = '';
    if (!this.isEmpty(this.stockTradeTemplate.jf17)) {
      this.detailObj.stockTradeTemplate.jf17 = this.stockTradeTemplate.jf17;
    }
    this.detailObj.stockTradeTemplate.jf18 = '';
    if (!this.isEmpty(this.stockTradeTemplate.jf18)) {
      this.detailObj.stockTradeTemplate.jf18 = this.stockTradeTemplate.jf18;
    }


    this.detailObj.stockTradeTemplate.yf1 = '';
    if (!this.isEmpty(this.stockTradeTemplate.yf1)) {
      this.detailObj.stockTradeTemplate.yf1 = this.stockTradeTemplate.yf1;
    }
    this.detailObj.stockTradeTemplate.yf2 = '';
    if (!this.isEmpty(this.stockTradeTemplate.yf2)) {
      this.detailObj.stockTradeTemplate.yf2 = this.stockTradeTemplate.yf2;
    }
    this.detailObj.stockTradeTemplate.yf3 = '';
    if (!this.isEmpty(this.stockTradeTemplate.yf3)) {
      this.detailObj.stockTradeTemplate.yf3 = this.stockTradeTemplate.yf3;
    }
    this.detailObj.stockTradeTemplate.yf4 = '';
    if (!this.isEmpty(this.stockTradeTemplate.yf4)) {
      this.detailObj.stockTradeTemplate.yf4 = this.stockTradeTemplate.yf4;
    }
    this.detailObj.stockTradeTemplate.yf5 = '';
    if (!this.isEmpty(this.stockTradeTemplate.yf5)) {
      this.detailObj.stockTradeTemplate.yf5 = this.stockTradeTemplate.yf5;
    }
    this.detailObj.stockTradeTemplate.yf6 = '';
    if (!this.isEmpty(this.stockTradeTemplate.yf6)) {
      this.detailObj.stockTradeTemplate.yf6 = this.stockTradeTemplate.yf6;
    }
    this.detailObj.stockTradeTemplate.yf7 = '';
    if (!this.isEmpty(this.stockTradeTemplate.yf7)) {
      this.detailObj.stockTradeTemplate.yf7 = this.stockTradeTemplate.yf7;
    }
    this.detailObj.stockTradeTemplate.yf8 = '';
    if (!this.isEmpty(this.stockTradeTemplate.yf8)) {
      this.detailObj.stockTradeTemplate.yf8 = this.stockTradeTemplate.yf8;
    }
    this.detailObj.stockTradeTemplate.yf9 = '';
    if (!this.isEmpty(this.stockTradeTemplate.yf9)) {
      this.detailObj.stockTradeTemplate.yf9 = this.stockTradeTemplate.yf9;
    }
    this.detailObj.stockTradeTemplate.yf10 = '';
    if (!this.isEmpty(this.stockTradeTemplate.yf10)) {
      this.detailObj.stockTradeTemplate.yf10 = this.stockTradeTemplate.yf10;
    }
    this.detailObj.stockTradeTemplate.yf11 = '';
    if (!this.isEmpty(this.stockTradeTemplate.yf11)) {
      this.detailObj.stockTradeTemplate.yf11 = this.stockTradeTemplate.yf11;
    }
    this.detailObj.stockTradeTemplate.yf12 = '';
    if (!this.isEmpty(this.stockTradeTemplate.yf12)) {
      this.detailObj.stockTradeTemplate.yf12 = this.stockTradeTemplate.yf12;
    }
    this.detailObj.stockTradeTemplate.yf13 = '';
    if (!this.isEmpty(this.stockTradeTemplate.yf13)) {
      this.detailObj.stockTradeTemplate.yf13 = this.stockTradeTemplate.yf13;
    }
    this.detailObj.stockTradeTemplate.yf14 = '';
    if (!this.isEmpty(this.stockTradeTemplate.yf14)) {
      this.detailObj.stockTradeTemplate.yf14 = this.stockTradeTemplate.yf14;
    }
    this.detailObj.stockTradeTemplate.yf15 = '';
    if (!this.isEmpty(this.stockTradeTemplate.yf15)) {
      this.detailObj.stockTradeTemplate.yf15 = this.stockTradeTemplate.yf15;
    }
    this.detailObj.stockTradeTemplate.yf16 = '';
    if (!this.isEmpty(this.stockTradeTemplate.yf16)) {
      this.detailObj.stockTradeTemplate.yf16 = this.stockTradeTemplate.yf16;
    }
    this.detailObj.stockTradeTemplate.yf17 = '';
    if (!this.isEmpty(this.stockTradeTemplate.yf17)) {
      this.detailObj.stockTradeTemplate.yf17 = this.stockTradeTemplate.yf17;
    }
    this.detailObj.stockTradeTemplate.yf18 = '';
    if (!this.isEmpty(this.stockTradeTemplate.yf18)) {
      this.detailObj.stockTradeTemplate.yf18 = this.stockTradeTemplate.yf18;
    }

    this.detailObj.stockTradeTemplate.d1t1 = '';
    if (!this.isEmpty(this.stockTradeTemplate.d1t1)) {
      this.detailObj.stockTradeTemplate.d1t1 = this.stockTradeTemplate.d1t1;
    }
    this.detailObj.stockTradeTemplate.d1t2 = '';
    if (!this.isEmpty(this.stockTradeTemplate.d1t2)) {
      this.detailObj.stockTradeTemplate.d1t2 = this.stockTradeTemplate.d1t2;
    }
    this.detailObj.stockTradeTemplate.d1t3 = '';
    if (!this.isEmpty(this.stockTradeTemplate.d1t3)) {
      this.detailObj.stockTradeTemplate.d1t3 = this.stockTradeTemplate.d1t3;
    }
    this.detailObj.stockTradeTemplate.d1t4 = '';
    if (!this.isEmpty(this.stockTradeTemplate.d1t4)) {
      this.detailObj.stockTradeTemplate.d1t4 = this.stockTradeTemplate.d1t4;
    }
    this.detailObj.stockTradeTemplate.d1t5 = '';
    if (!this.isEmpty(this.stockTradeTemplate.d1t5)) {
      this.detailObj.stockTradeTemplate.d1t5 = this.stockTradeTemplate.d1t5;
    }
    this.detailObj.stockTradeTemplate.d1t6 = '';
    if (!this.isEmpty(this.stockTradeTemplate.d1t6)) {
      this.detailObj.stockTradeTemplate.d1t6 = this.stockTradeTemplate.d1t6;
    }
    this.detailObj.stockTradeTemplate.d1t7 = '';
    if (!this.isEmpty(this.stockTradeTemplate.d1t7)) {
      this.detailObj.stockTradeTemplate.d1t7 = this.stockTradeTemplate.d1t7;
    }

    //  console.log(typeof(this.stockTradeTemplate.d1t8).toString());
    // console.log(this.stockTradeTemplate.d1t8.toLocaleDateString());
    // const d1t8 = this.dateTostring(this.stockTradeTemplate.d1t8);
    // console.log(str);
    this.detailObj.stockTradeTemplate.d1t8 = this.stockTradeTemplate.d1t8;
    // if (!this.isEmpty(d1t8)) {
    //   this.detailObj.stockTradeTemplate.d1t8 = d1t8;
    // }
    //console.log(this.detailObj.stockTradeTemplate.d1t8);
    this.detailObj.stockTradeTemplate.d1t9 = '';
    if (!this.isEmpty(this.stockTradeTemplate.d1t9)) {
      this.detailObj.stockTradeTemplate.d1t9 = this.stockTradeTemplate.d1t9;
    }
    this.detailObj.stockTradeTemplate.d1t10 = '';
    if (!this.isEmpty(this.stockTradeTemplate.d1t10)) {
      this.detailObj.stockTradeTemplate.d1t10 = this.stockTradeTemplate.d1t10;
    }


    this.detailObj.stockTradeTemplate.d2t1 = '';
    if (!this.isEmpty(this.stockTradeTemplate.d2t1)) {
      this.detailObj.stockTradeTemplate.d2t1 = this.stockTradeTemplate.d2t1;
    }
    this.detailObj.stockTradeTemplate.d2t2 = '';
    if (!this.isEmpty(this.stockTradeTemplate.d2t2)) {
      this.detailObj.stockTradeTemplate.d2t2 = this.stockTradeTemplate.d2t2;
    }


    this.detailObj.stockTradeTemplate.d3t1 = '';
    if (!this.isEmpty(this.stockTradeTemplate.d3t1)) {
      this.detailObj.stockTradeTemplate.d3t1 = this.stockTradeTemplate.d3t1;
    }
    this.detailObj.stockTradeTemplate.d3t2 = '';
    if (!this.isEmpty(this.stockTradeTemplate.d3t2)) {
      this.detailObj.stockTradeTemplate.d3t2 = this.stockTradeTemplate.d3t2;
    }
    this.detailObj.stockTradeTemplate.d3t3 = '';
    if (!this.isEmpty(this.stockTradeTemplate.d3t3)) {
      this.detailObj.stockTradeTemplate.d3t3 = this.stockTradeTemplate.d3t3;
    }
    this.detailObj.stockTradeTemplate.d3t4 = '';
    if (!this.isEmpty(this.stockTradeTemplate.d3t4)) {
      this.detailObj.stockTradeTemplate.d3t4 = this.stockTradeTemplate.d3t4;
    }
    this.detailObj.stockTradeTemplate.d3t5 = '';
    if (!this.isEmpty(this.stockTradeTemplate.d3t5)) {
      this.detailObj.stockTradeTemplate.d3t5 = this.stockTradeTemplate.d3t5;
    }
    // console.log();
    // const d3t6 = this.dateTostring(this.stockTradeTemplate.d3t6);
    // this.detailObj.stockTradeTemplate.d3t6 = '';
    // if (!this.isEmpty(d3t6)) {
    this.detailObj.stockTradeTemplate.d3t6 = this.stockTradeTemplate.d3t6;
    // }
    this.detailObj.stockTradeTemplate.d3t7 = '';
    if (!this.isEmpty(this.stockTradeTemplate.d3t7)) {
      this.detailObj.stockTradeTemplate.d3t7 = this.stockTradeTemplate.d3t7;
    }
    this.detailObj.stockTradeTemplate.d3t8 = '';
    if (!this.isEmpty(this.stockTradeTemplate.d3t8)) {
      this.detailObj.stockTradeTemplate.d3t8 = this.stockTradeTemplate.d3t8;
    }
    this.detailObj.stockTradeTemplate.d3t9 = '';
    if (!this.isEmpty(this.stockTradeTemplate.d3t9)) {
      this.detailObj.stockTradeTemplate.d3t9 = this.stockTradeTemplate.d3t9;
    }
    this.detailObj.stockTradeTemplate.d3t10 = '';
    if (!this.isEmpty(this.stockTradeTemplate.d3t10)) {
      this.detailObj.stockTradeTemplate.d3t10 = this.stockTradeTemplate.d3t10;
    }
    this.detailObj.stockTradeTemplate.d3t11 = '';
    if (!this.isEmpty(this.stockTradeTemplate.d3t11)) {
      this.detailObj.stockTradeTemplate.d3t11 = this.stockTradeTemplate.d3t11;
    }
    this.detailObj.stockTradeTemplate.d3t12 = '';
    if (!this.isEmpty(this.stockTradeTemplate.d3t12)) {
      this.detailObj.stockTradeTemplate.d3t12 = this.stockTradeTemplate.d3t12;
    }
    this.detailObj.stockTradeTemplate.d3t13 = '';
    if (!this.isEmpty(this.stockTradeTemplate.d3t13)) {
      this.detailObj.stockTradeTemplate.d3t13 = this.stockTradeTemplate.d3t13;
    }
    this.detailObj.stockTradeTemplate.d3t14 = '';
    if (!this.isEmpty(this.stockTradeTemplate.d3t14)) {
      this.detailObj.stockTradeTemplate.d3t14 = this.stockTradeTemplate.d3t14;
    }
    this.detailObj.stockTradeTemplate.d3t15 = '';
    if (!this.isEmpty(this.stockTradeTemplate.d3t15)) {
      this.detailObj.stockTradeTemplate.d3t15 = this.stockTradeTemplate.d3t15;
    }
    this.detailObj.stockTradeTemplate.d3t16 = '';
    if (!this.isEmpty(this.stockTradeTemplate.d3t16)) {
      this.detailObj.stockTradeTemplate.d3t16 = this.stockTradeTemplate.d3t16;
    }
    this.detailObj.stockTradeTemplate.d3t17 = '';
    if (!this.isEmpty(this.stockTradeTemplate.d3t17)) {
      this.detailObj.stockTradeTemplate.d3t17 = this.stockTradeTemplate.d3t17;
    }
    this.detailObj.stockTradeTemplate.d3t18 = '';
    if (!this.isEmpty(this.stockTradeTemplate.d3t18)) {
      this.detailObj.stockTradeTemplate.d3t18 = this.stockTradeTemplate.d3t18;
    }
    this.detailObj.stockTradeTemplate.d3t19 = '';
    if (!this.isEmpty(this.stockTradeTemplate.d3t19)) {
      this.detailObj.stockTradeTemplate.d3t19 = this.stockTradeTemplate.d3t19;
    }
    this.detailObj.stockTradeTemplate.d3t20 = '';
    if (!this.isEmpty(this.stockTradeTemplate.d3t20)) {
      this.detailObj.stockTradeTemplate.d3t20 = this.stockTradeTemplate.d3t20;
    }
    this.detailObj.stockTradeTemplate.d3t21 = '';
    if (!this.isEmpty(this.stockTradeTemplate.d3t21)) {
      this.detailObj.stockTradeTemplate.d3t21 = this.stockTradeTemplate.d3t21;
    }
    this.detailObj.stockTradeTemplate.d3t22 = '';
    if (!this.isEmpty(this.stockTradeTemplate.d3t22)) {
      this.detailObj.stockTradeTemplate.d3t22 = this.stockTradeTemplate.d3t22;
    }
    this.detailObj.stockTradeTemplate.d3t23 = '';
    if (!this.isEmpty(this.stockTradeTemplate.d3t23)) {
      this.detailObj.stockTradeTemplate.d3t23 = this.stockTradeTemplate.d3t23;
    }
    this.detailObj.stockTradeTemplate.d3t24 = '';
    if (!this.isEmpty(this.stockTradeTemplate.d3t24)) {
      this.detailObj.stockTradeTemplate.d3t24 = this.stockTradeTemplate.d3t24;
    }
    this.detailObj.stockTradeTemplate.d3t25 = '';
    if (!this.isEmpty(this.stockTradeTemplate.d3t25)) {
      this.detailObj.stockTradeTemplate.d3t25 = this.stockTradeTemplate.d3t25;
    }
    this.detailObj.stockTradeTemplate.d3t26 = '';
    if (!this.isEmpty(this.stockTradeTemplate.d3t26)) {
      this.detailObj.stockTradeTemplate.d3t26 = this.stockTradeTemplate.d3t26;
    }
    this.detailObj.stockTradeTemplate.d3t27 = '';
    if (!this.isEmpty(this.stockTradeTemplate.d3t27)) {
      this.detailObj.stockTradeTemplate.d3t27 = this.stockTradeTemplate.d3t27;
    }


    this.detailObj.stockTradeTemplate.d4t1 = '';
    if (!this.isEmpty(this.stockTradeTemplate.d4t1)) {
      this.detailObj.stockTradeTemplate.d4t1 = this.stockTradeTemplate.d4t1;
    }
    this.detailObj.stockTradeTemplate.d4t2 = '';
    if (!this.isEmpty(this.stockTradeTemplate.d4t2)) {
      this.detailObj.stockTradeTemplate.d4t2 = this.stockTradeTemplate.d4t2;
    }


    this.detailObj.stockTradeTemplate.d5t1 = '';
    if (!this.isEmpty(this.stockTradeTemplate.d5t1)) {
      this.detailObj.stockTradeTemplate.d5t1 = this.stockTradeTemplate.d5t1;
    }

    // const d6t1 = this.dateTostring(this.stockTradeTemplate.d6t1);
    // this.detailObj.stockTradeTemplate.d6t1 = '';
    // if (!this.isEmpty(d6t1)) {
    this.detailObj.stockTradeTemplate.d6t1 = this.stockTradeTemplate.d6t1;
    // }
    // const d6t2 = this.dateTostring(this.stockTradeTemplate.d6t2);
    this.detailObj.stockTradeTemplate.d6t2 = this.stockTradeTemplate.d6t2;
    // if (!this.isEmpty(d6t2)) {
    //   this.detailObj.stockTradeTemplate.d6t2 = d6t2;
    // }


    this.detailObj.stockTradeTemplate.d7t1 = '';
    if (!this.isEmpty(this.stockTradeTemplate.d7t1)) {
      this.detailObj.stockTradeTemplate.d7t1 = this.stockTradeTemplate.d7t1;
    }
    this.detailObj.stockTradeTemplate.d7t2 = '';
    if (!this.isEmpty(this.stockTradeTemplate.d7t2)) {
      this.detailObj.stockTradeTemplate.d7t2 = this.stockTradeTemplate.d7t2;
    }
    this.detailObj.stockTradeTemplate.d7t3 = '';
    if (!this.isEmpty(this.stockTradeTemplate.d7t3)) {
      this.detailObj.stockTradeTemplate.d7t3 = this.stockTradeTemplate.d7t3;
    }
    this.detailObj.stockTradeTemplate.d7t4 = '';
    if (!this.isEmpty(this.stockTradeTemplate.d7t4)) {
      this.detailObj.stockTradeTemplate.d7t4 = this.stockTradeTemplate.d7t4;
    }

    this.detailObj.stockTradeTemplate.d8t1 = '';
    if (!this.isEmpty(this.stockTradeTemplate.d8t1)) {
      this.detailObj.stockTradeTemplate.d8t1 = this.stockTradeTemplate.d8t1;
    }
    this.detailObj.stockTradeTemplate.d8t2 = '';
    if (!this.isEmpty(this.stockTradeTemplate.d8t2)) {
      this.detailObj.stockTradeTemplate.d8t2 = this.stockTradeTemplate.d8t2;
    }
    this.detailObj.stockTradeTemplate.d8t3 = '';
    if (!this.isEmpty(this.stockTradeTemplate.d8t3)) {
      this.detailObj.stockTradeTemplate.d8t3 = this.stockTradeTemplate.d8t3;
    }
    this.detailObj.stockTradeTemplate.d8t4 = '';
    if (!this.isEmpty(this.stockTradeTemplate.d8t4)) {
      this.detailObj.stockTradeTemplate.d8t4 = this.stockTradeTemplate.d8t4;
    }


    this.detailObj.stockTradeTemplate.d9t1 = '';
    if (!this.isEmpty(this.stockTradeTemplate.d9t1)) {
      this.detailObj.stockTradeTemplate.d9t1 = this.stockTradeTemplate.d9t1;
    }
    this.detailObj.stockTradeTemplate.d9t2 = '';
    if (!this.isEmpty(this.stockTradeTemplate.d9t2)) {
      this.detailObj.stockTradeTemplate.d9t2 = this.stockTradeTemplate.d9t2;
    }
    this.detailObj.stockTradeTemplate.d9t3 = '';
    if (!this.isEmpty(this.stockTradeTemplate.d9t3)) {
      this.detailObj.stockTradeTemplate.d9t3 = this.stockTradeTemplate.d9t3;
    }
    this.detailObj.stockTradeTemplate.d9t4 = '';
    if (!this.isEmpty(this.stockTradeTemplate.d9t4)) {
      this.detailObj.stockTradeTemplate.d9t4 = this.stockTradeTemplate.d9t4;
    }


    this.detailObj.stockTradeTemplate.d10t1 = '';
    if (!this.isEmpty(this.stockTradeTemplate.d10t1)) {
      this.detailObj.stockTradeTemplate.d10t1 = this.stockTradeTemplate.d10t1;
    }
    this.detailObj.stockTradeTemplate.d10t2 = '';
    if (!this.isEmpty(this.stockTradeTemplate.d10t2)) {
      this.detailObj.stockTradeTemplate.d10t2 = this.stockTradeTemplate.d10t2;
    }
    this.detailObj.stockTradeTemplate.d10t3 = '';
    if (!this.isEmpty(this.stockTradeTemplate.d10t3)) {
      this.detailObj.stockTradeTemplate.d10t3 = this.stockTradeTemplate.d10t3;
    }

    this.detailObj.stockTradeTemplate.d11t1 = '';
    if (!this.isEmpty(this.stockTradeTemplate.d11t1)) {
      this.detailObj.stockTradeTemplate.d11t1 = this.stockTradeTemplate.d11t1;
    }
    this.detailObj.stockTradeTemplate.d11t2 = '';
    if (!this.isEmpty(this.stockTradeTemplate.d11t2)) {
      this.detailObj.stockTradeTemplate.d11t2 = this.stockTradeTemplate.d11t2;
    }


    this.detailObj.stockTradeTemplate.d12t1 = '';
    if (!this.isEmpty(this.stockTradeTemplate.d12t1)) {
      this.detailObj.stockTradeTemplate.d12t1 = this.stockTradeTemplate.d12t1;
    }
    this.detailObj.stockTradeTemplate.d12t2 = '';
    if (!this.isEmpty(this.stockTradeTemplate.d12t2)) {
      this.detailObj.stockTradeTemplate.d12t2 = this.stockTradeTemplate.d12t2;
    }


    this.detailObj.stockTradeTemplate.qz1 = '';
    if (!this.isEmpty(this.stockTradeTemplate.qz1)) {
      this.detailObj.stockTradeTemplate.qz1 = this.stockTradeTemplate.qz1;
    }
    this.detailObj.stockTradeTemplate.qz2 = '';
    if (!this.isEmpty(this.stockTradeTemplate.qz2)) {
      this.detailObj.stockTradeTemplate.qz2 = this.stockTradeTemplate.qz2;
    }
    this.detailObj.stockTradeTemplate.qz3 = '';
    if (!this.isEmpty(this.stockTradeTemplate.qz3)) {
      this.detailObj.stockTradeTemplate.qz3 = this.stockTradeTemplate.qz3;
    }

    this.detailObj.stockTradeTemplate.qz4 = this.stockTradeTemplate.qz4;

    this.detailObj.stockTradeTemplate.qz5 = '';
    if (!this.isEmpty(this.stockTradeTemplate.qz5)) {
      this.detailObj.stockTradeTemplate.qz5 = this.stockTradeTemplate.qz5;
    }
    this.detailObj.stockTradeTemplate.qz6 = '';
    if (!this.isEmpty(this.stockTradeTemplate.qz6)) {
      this.detailObj.stockTradeTemplate.qz6 = this.stockTradeTemplate.qz6;
    }
    this.detailObj.stockTradeTemplate.qz7 = '';
    if (!this.isEmpty(this.stockTradeTemplate.qz7)) {
      this.detailObj.stockTradeTemplate.qz7 = this.stockTradeTemplate.qz7;
    }

    this.detailObj.stockTradeTemplate.qz8 = this.stockTradeTemplate.qz8;


    // this.detailObj.stockTradeTemplate = JSON.stringify(this.stockTradeTemplate);
    // console .log(this.detailObj.stockTradeTemplate);

    const res = await this.stockTradeService.saveOrUpdateStockTrade(this.detailObj);
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
    this.isOkLoading = false;
    this.uploadComponent.fileList = [];
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
    if (item) {// 单个删除
      ids.push(item.id);
    } else {// 批量删除
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
    } else {
      this.msg.create('error', '删除失败');
    }
  }

  // 下载
  btachDown(item?) {
    const ids = [];
    if (item) {// 单个
      ids.push(item.id);
    } else {// 批量
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

  addJf() {
    if (!this.jfList) {
      this.jfList = [];
    }
    const jf = {
      jf: '',
      jflxdz: '',
      jfzjlx: '',
      jfzjhm: '',
      jflxdh: '',
      jfgyfs: '',
      jfgybl: ''
    };
    this.jfList.push(jf);

  }

  deleteJf(obj, i) {
    this.jfList.splice(i, 1);
  }


  addYf() {
    if (!this.yfList) {
      this.yfList = [];
    }
    const yf = {
      yf: '',
      yflxdz: '',
      yfzjlx: '',
      yfzjhm: '',
      yflxdh: '',
      yfgyfs: '',
      yfgybl: ''
    };
    this.yfList.push(yf);

  }

  deleteYf(obj, i) {
    this.yfList.splice(i, 1);
  }

  nameChange() {
    // if (this.detailObj && this.detailObj.relationShips && this.detailObj.relationShips.length > 0) {
    //   var name = "";
    //   this.detailObj.relationShips.forEach(element => {
    //     name += element.name + ",";
    //   });
    //   this.detailObj.yf = name.substring(0, name.length - 1);
    // }
  }

  ngAfterViewInit() {
    const that = this;
    $(window).resize(function () {
      that.calculationHeight();
    });
  }

  isbtShow() {
    // console .log(this.detailObj.id.length);
    // if (this.detailObj.id.length > 0) {
    //   // this.btShow = true;
    // }
  }

  async wordShow() {

    // let url = AppConfig.Configuration.baseUrl + "/StockTrade/previewHt?id=" + data.id;
    // url = this.utilitiesSercice.wrapUrl(url);
    // window.open('assets/usermanual/web/viewer.html?url=' + url, '_blank');
    let url = AppConfig.Configuration.baseUrl + '/StockTrade/previewHt?id=' + this.detailObj.id;
    url = this.utilitiesSercice.wrapUrl(url);
    window.open('assets/usermanual/web/viewer.html?url=' + url, '_blank');
  }

  // 合同中无内容时基本信息直接覆盖过去
  fwjgValue(value: number): void {
    console.log(value);
    if (value > 0 && (this.stockTradeTemplate.d1t4 == undefined || this.stockTradeTemplate.d1t4 == '')) {
      const i = value - 1;
      console.log(this.dictionaryObj.fwjg[i].name);
      this.stockTradeTemplate.d1t4 = this.dictionaryObj.fwjg[i].name;
    }

  }

  // 合同中无内容时基本信息直接覆盖过去 对应合同中办证时间
  djsjValue(value: Date): void {
    if (value != undefined && (this.stockTradeTemplate.d1t8 == undefined || this.stockTradeTemplate.d1t8 == '')) {
      this.stockTradeTemplate.d1t8 = value;
    }

  }


  bdcqzhValue(value: string): void {
    if (this.stockTradeTemplate.d1t6 == undefined || this.stockTradeTemplate.d1t6 == '') {
      this.stockTradeTemplate.d1t6 = this.detailObj.bdcqzh;
    }

  }

  zjValue(value: string): void {
    if (this.stockTradeTemplate.d2t1 == undefined || this.stockTradeTemplate.d2t1 == '') {
      this.stockTradeTemplate.d2t1 = this.detailObj.zj;
      this.fwzrjeTodx(this.stockTradeTemplate.d2t1);
    }

  }

  djValue(value: string): void {
    if (this.stockTradeTemplate.d2t2 == undefined || this.stockTradeTemplate.d2t2 == '') {
      this.stockTradeTemplate.d2t2 = this.detailObj.dj;
    }

  }
}
