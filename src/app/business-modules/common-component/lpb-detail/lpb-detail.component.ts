import { Component, OnInit, Input, Output, EventEmitter, ViewChildren, QueryList } from '@angular/core';
import { LpbglService } from '../../service/lpbgl/lpbgl.service';
import { Localstorage } from '../../service/localstorage';
import { UtilitiesSercice } from '../../service/common/utilities.services';
import { NzMessageService } from 'ng-zorro-antd';
import { ValidationDirective } from '../../../layout/_directives/validation.directive';
import { Router, ActivatedRoute } from '@angular/router';
import { KfxmglService } from '../../service/xmgl/kfxmgl.service';


@Component({
  selector: 'app-lpb-detail',
  templateUrl: './lpb-detail.component.html',
  styleUrls: ['./lpb-detail.component.scss']
})
export class LpbDetailComponent implements OnInit {
  @ViewChildren(ValidationDirective) directives: QueryList<ValidationDirective>;
  @Input() glType: string;
  @Input() moduleType: string;
  @Input() isDisable = true;
  @Output() restrictedProperty = new EventEmitter<string>();
  @Output() saveLjz = new EventEmitter<any>();

  zrzShow: boolean = true;
  detailObj: any = {};
  tabsetIndex2 = 0;
  tabs2 = [];
  lpbList: any = {
    ljzStatistical: {}
  };
  rowSpan = 0;
  dictionaryObj: any = {};
  selectedHu: any = {};
  selectedCe: any = {};
  selectH: string = "1";
  isVisible = false;
  ljzObj: any = {};
  isVisibleC = false;
  cObj: any = {};
  isVisibleH = false;
  hObj: any = {};
  ljzValidation = false;
  cValidation = false;
  hValidation = false;
  isAddLjz = false;
  isAddHu = false;
  isAddCe = false;
  companyList: any[] = [];
  companyLoading: boolean = false;
  selectedLJZid = "";
  selectId: "";

  isVisibleViewHistory = false;

  constructor(
    private lpbglService: LpbglService,
    private localstorage: Localstorage,
    private utilitiesSercice: UtilitiesSercice,
    private msg: NzMessageService,
    private router: Router,
    private kfxmglService: KfxmglService
  ) { }


  // 添加权限
  isShow: boolean = true;

  getRoles() {
    let roles = this.localstorage.getObject("roles");

    if (roles) {
      if (roles.some(x => x == '开发企业') || roles.some(x => x == '经纪公司')) {
        this.isShow = false;
      }
    }
  }

  ngOnInit() {
    this.dictionaryObj = this.localstorage.getObject("dictionary");
    this.getRoles();
  }

  init(detailObj) {
    this.tabs2 = [];
    this.detailObj = detailObj;
    this.onSearch(this.detailObj.xmmc);

    if (detailObj && detailObj.ljzList.length > 0) {
      // this.tabsetIndex2 = 0;
      if (this.isAddLjz) {
        this.tabsetIndex2 = detailObj.ljzList.length - 1;
      }
      if (this.tabsetIndex2 > detailObj.ljzList.length) {
        this.tabsetIndex2 = detailObj.ljzList.length - 1;
      }
      this.lpbList = detailObj.ljzList[this.tabsetIndex2];

      if (this.lpbList.dyList && this.lpbList.dyList.length > 0) {
        this.lpbList.dyList.forEach((v, k) => {
          this.rowSpan += v.rowSpan;
        })
      }



      detailObj.ljzList.forEach((v, k) => {
        this.tabs2.push({
          name: v.ljzh,
          index: k,
          id: v.id,
          mph: v.mph
        })

        // if(k == detailObj.ljzList.length - 1&&!this.isDisable){
        //   this.tabs2.push({
        //     name: '添加',
        //     index: k + 1,
        //     id: 0
        //   })
        // }



      })
      this.tabsetChange2(this.tabsetIndex2)

    } else {
      // if(!this.isDisable){
      //   this.tabs2.push({
      //     name: '添加',
      //     index: 0,
      //     id: 0
      //   })

      //   this.tabsetIndex2 = -1;
      // }

    }
  }

  init1(data) {
    this.zrzShow = false;

    this.lpbList = data;

    this.lpbList.dyList.forEach((v, k) => {
      this.rowSpan += v.rowSpan;
    })
  }

  selectedHuChange(item) {
    this.selectedHu = item;
  }

  selectedCeChange(item) {
    this.selectedCe = item;
  }


  restrictedProperty1(type) {
    if (this.restrictedProperty) {
      this.restrictedProperty.emit(type);
    }
  }

  tabsetChange2(m) {
    this.tabsetIndex2 = m;
    var id = this.tabs2[m].id;
    this.selectedLJZid = this.tabs2[m].id;
    this.getLpb(id);

  }

  tabClick() {
    this.addLjz(1);
  }

  async getLpb(id) {
    this.rowSpan = 0;

    var res = await this.lpbglService.getLjz(id);

    if (res && res.code == 200) {
      this.lpbList = res.msg;
      this.lpbList.dyList.forEach((v, k) => {
        this.rowSpan += v.rowSpan;
      })

    }
  }

  perview() {

    let url = AppConfig.Configuration.baseUrl + "/BuildingTable/printHt?id=" + this.selectedHu.id + "&type=" + this.selectedHu.tradeType;
    url = this.utilitiesSercice.wrapUrl(url);
    window.open('assets/usermanual/web/viewer.html?url=' + url, '_blank');


  }

  contract(huparam) {
    if (!huparam.id || !huparam.isnewstock) {
      this.msg.create('error', '该房屋信息信息有误，无法备案');
    }
    if (huparam.isnewstock == 1 && huparam.tradeType == 0) {
      var route = "/contract/houseTrade/detail";
      this.router.navigate([route], {
        queryParams: {
          type: 1,
          hid: huparam.id
        }
      });
    } else {
      var route = "/contract/stockTrade/detail";
      this.router.navigate([route], {
        queryParams: {
          type: 1,
          hid: huparam.id
        }
      });
    }

  }



  handleCancel() {
    this.ljzValidation = false;
    this.hValidation = false;
    this.cValidation = false;
    this.isVisible = false;
    this.isVisibleC = false;
    this.isVisibleH = false;
    this.isVisibleViewHistory = false;

  }


  handleOk(m) {
    if (m == 1) {//保存逻辑幢

      this.saveOrUpdateLJZ(1);
      this.isAddLjz = true;
    } else if (m == 2) {//保存层

      this.saveC();
    } else if (m == 3) {//保存户

      this.saveH(1);
    }

  }

  //添加编辑逻辑幢
  async addLjz(m?) {
    this.ljzValidation = true;
    this.hValidation = false;
    this.cValidation = false;

    this.ljzObj.ljzh = "L" + this.utilitiesSercice.getTimeStamp(),
      this.ljzObj.zcs = "",

      this.ljzObj.scjzmj = "",
      this.ljzObj.fwyt1 = ""

    this.isVisible = true;
  }

  async saveOrUpdateLJZ(type) {
    if (!this.FormValidation()) {
      return;
    }
    var option
    if (type == 1) {//添加
      option = Object.assign({}, this.ljzObj);
      option.zrzh = this.detailObj.zrzh;
      option.qxdm = '361129';

    } else {
      option = this.lpbList
    }
    if (option.jgrq) {
      option.jgrq = option.jgrq.getTime();
    }


    var res = await this.lpbglService.saveOrUpdateLJZ(option);
    if (res && res.code == 200) {
      this.msg.create('success', '保存成功');

      this.isVisible = false;
      this.saveLjz.emit();
    } else {
      this.msg.create('error', res.msg);
    }
  }

  addC() {
    this.ljzValidation = false;
    this.hValidation = false;
    this.cValidation = true;
    this.cObj.ch = "";
    this.cObj.sjc = "";
    this.cObj.sfqfdy = "1";
    this.isVisibleC = true;
    this.isAddCe = true;
  }

  //保存层
  async saveC() {
    if (!this.FormValidation()) {
      return;
    }
    var option;

    if (this.isAddCe) {
      option = {
        ljzh: this.tabs2[this.tabsetIndex2].name,
        zrzh: this.detailObj.zrzh,
        sjc: this.cObj.sjc,
        ch: this.cObj.ch,
        myc: this.cObj.myc,
        sfqfdy: this.cObj.sfqfdy,
        qxdm: '361129',
      };
    } else {
      option = this.cObj;
    }

    var res = await this.lpbglService.saveOrUpdateC(option);
    if (res && res.code == 200) {
      this.msg.create('success', '保存成功');
      this.getLpb(this.tabs2[this.tabsetIndex2].id);
      this.isVisibleC = false;
    } else {
      this.msg.create('error', res.msg);
    }
  }

  addH() {
    this.ljzValidation = false;
    this.hValidation = true;
    this.cValidation = false;
    this.hObj = {};
    this.isVisibleH = true;
    this.isAddHu = true;
    this.isAddCe = true;
    this.hObj.zrzh = this.detailObj.zrzh;
    this.hObj.ljzh = this.lpbList.ljzh
  }

  //保存户
  async saveH(type) {
    if (!this.FormValidation()) {
      return;
    }
    var option;
    if (this.isAddHu) {
      option = Object.assign({}, this.hObj);
      option.ljzh = this.tabs2[this.tabsetIndex2].name;
      option.zrzh = this.detailObj.zrzh;
      // option.mjdw = "1";
      option.qxdm = '361129';
      option.isnewstock = Number(option.isnewstock)
    } else {
      option = this.hObj;
    }


    var res = await this.lpbglService.saveOrUpdateH(option);
    if (res && res.code == 200) {
      this.msg.create('success', '保存成功');
      this.getLpb(this.tabs2[this.tabsetIndex2].id);
      this.isVisibleH = false;
    } else {
      this.msg.create('error', res.msg);
    }
  }

  //编辑户
  async editH(id) {
    this.isVisibleH = true;
    this.isAddHu = false;
    this.hValidation = true;
    var res = await this.lpbglService.getHById(id);
    if (res && res.code == 200) {
      this.hObj = res.msg;
      if (this.hObj.isnewstock) {
        this.hObj.isnewstock = this.hObj.isnewstock.toString();
      }
      if (this.hObj.zt || this.hObj.zt == 0) {
        this.hObj.zt = Number(this.hObj.zt);
      }

    } else {
      this.msg.create('error', res.msg);
    }

  }

  shbwChange(event) {
    this.hObj.mph = event;
  }

  //编辑c层
  async editC(id) {
    this.isVisibleC = true;
    this.isAddCe = false;
    this.cValidation = true;
    var res = await this.lpbglService.getCById(id);
    if (res && res.code == 200) {
      this.cObj = res.msg;

    } else {
      this.msg.create('error', res.msg);
    }

  }

  selectItem(data) {
    this.selectId = data.id;
  }

  //删除逻辑幢
  async deleteLjz(id) {
    var res = await this.lpbglService.deleteLJZ(id);
    if (res && res.code == 200) {
      this.msg.create('success', '删除成功');


      this.saveLjz.emit();

    } else {
      this.msg.create('error', res.msg);
    }
  }

  //删除户
  async deleteH(id) {
    var res = await this.lpbglService.deleteH(id);
    if (res && res.code == 200) {
      this.msg.create('success', '删除成功');
      this.getLpb(this.tabs2[this.tabsetIndex2].id);

    } else {
      this.msg.create('error', res.msg);
    }
  }

  //删除层
  async deleteC(id) {
    var res = await this.lpbglService.deleteC(id);
    if (res && res.code == 200) {
      this.msg.create('success', '删除成功');
      this.getLpb(this.tabs2[this.tabsetIndex2].id);

    } else {
      this.msg.create('error', res.msg);
    }
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
    this.detailObj.xmid = evt;

    if (evt) {
      let select = this.companyList.find(x => evt == x.id);

      if (select) {
        this.detailObj.xmid = select.xmid;
      }
    } else {
      this.detailObj.xmid = null;
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


  pageIndex: any = 1;
  totalCount: any = 0;
  pageSize: any = 10;
  Loading = false;
  tableIsScroll = null;
  dataSet: any = [];
  sortList: any = [];

  viewHistory() {
    this.isVisibleViewHistory = true;
    this.pageIndex = 1;
    this.search();
  }

  async search() {
    this.Loading = true;
    var option = {
      pageNo: this.pageIndex,
      pageSize: this.pageSize,
      conditions: [{ key: 'id', value: this.selectedHu.id }]
    };

    option.conditions.push({ key: 'sort', value: this.sortList });

    var res = await this.lpbglService.getBAHistory(option);
    this.Loading = false;
    if (res && res.code == 200) {
      this.dataSet = res.msg.currentList;
      this.totalCount = res.msg.recordCount;
    }
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

  viewContract(data) {
    var route = "";
    if (data.isnewstock == 1) {
      route = "/contract/houseTrade/detail";
    } else if (data.isnewstock == 2) {
      route = "/contract/stockTrade/detail";
    }
    this.router.navigate([route], {
      queryParams: {
        id: data.id,
        type: 2
      }
    });
  }


}
