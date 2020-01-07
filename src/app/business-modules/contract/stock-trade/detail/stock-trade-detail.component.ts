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

  downLoadurl = AppConfig.Configuration.baseUrl + "/FileInfo/download";
  tabs = [
    { name: '合同信息', index: 0 },
    { name: '附件', index: 1 },
    { name: '关联户信息', index: 2 },
    // { name: '关联企业', index: 3 }
  ]
  tabsetIndex = 0;
  isDisable = false;
  detailObj: any = {};
  hid: "";
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
  currentImg = "";


  selectedHu: any = {};
  moduleType = "";
  fileType = 0;

  showBalc = false;
  timeline = [
    { name: '基础信息录入', state: 0 },
    { name: '受理', state: 1 },
    { name: '初审', state: 2 },
    { name: '核定', state: 3 },
    { name: '登簿', state: 4 },
    { name: '生成合同', state: 5 }
  ]
  fileTypeList = [];
  fileTypeIndex = 0;

  rowSpan: any = 0;
  lpbList: any = [];
  selectH: any = "";

  isbusy = false;
  bg = "";

  associatedCompanyShow: boolean = false;

  //甲方集合
  jfList: any = [];
  //乙方集合
  yfList: any = [];


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
    var type = this.activatedRoute.snapshot.queryParams.type;
    this.detailObj.id = this.activatedRoute.snapshot.queryParams.id;
    this.moduleType = this.activatedRoute.snapshot.queryParams.moduleType;

    let pid = this.activatedRoute.snapshot.queryParams["pid"];
    this.detailObj.id = pid ? pid : this.detailObj.id;
    //直接从楼盘表页面跳转过来备案
    this.hid = this.activatedRoute.snapshot.queryParams.hid;

    let glType = this.activatedRoute.snapshot.queryParams["glType"];
    this.bg = this.activatedRoute.snapshot.queryParams["bg"];

    this.tabsetIndex = glType ? 2 : 0;

    if (type == 2) {
      this.isDisable = true;
      this.tabs = [
        { name: '合同信息', index: 0 },
        { name: '附件', index: 1 },
        { name: '关联企业', index: 2 }
      ]

      this.associatedCompanyShow = true;
    } else if (type == 3) {
      this.tabs.push({ name: '关联企业', index: 3 });
    }

    switch (type) {
      case '1'://添加
        this.isDisable = false;
        break;
      case '2'://查看
        this.isDisable = true;
        break;
      case '3'://编辑
        this.isDisable = false;
        break;
      default:
        break;
    }

  }

  ngOnInit() {
    this.dictionaryObj = this.localstorage.getObject("dictionary");

    if (this.detailObj.id) {
      this.getDetail();
    } else if (this.hid) {
      this.detailObj.houseId = this.hid;
      this.getHInfo();
    }
    this.search();



  }

  async getDetail() {
    var res = await this.stockTradeService.getStockTradeById(this.detailObj.id);
    if (res && res.code == 200) {
      this.detailObj = res.msg;

      if (this.detailObj.wfAuditList.length > 0) {
        this.detailObj.wfAuditList.forEach((v, k) => {
          if (v.shrq) {
            v.shrq = Moment(v.shrq).format('YYYY-MM-DD')
          }

        })

      }
      if (this.detailObj.ljzid) {
        this.selectH = this.detailObj.houseId;
        this.getLpb(this.detailObj.ljzid);
      }

      var jf = this.buildInfoList(this.detailObj.jf);
      var jflxdz = this.buildInfoList(this.detailObj.jflxdz);
      var jfzjlx = this.buildInfoList(this.detailObj.jfzjlx);
      var jfzjhm = this.buildInfoList(this.detailObj.jfzjhm);
      var jflxdh = this.buildInfoList(this.detailObj.jflxdh);
      var jfgyfs = this.buildInfoList(this.detailObj.jfgyfs);
      var jfgybl = this.buildInfoList(this.detailObj.jfgybl);

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


      var yf = this.buildInfoList(this.detailObj.yf);
      var yflxdz = this.buildInfoList(this.detailObj.yflxdz);
      var yfzjlx = this.buildInfoList(this.detailObj.yfzjlx);
      var yfzjhm = this.buildInfoList(this.detailObj.yfzjhm);
      var yflxdh = this.buildInfoList(this.detailObj.yflxdh);
      var yfgyfs = this.buildInfoList(this.detailObj.yfgyfs);
      var yfgybl = this.buildInfoList(this.detailObj.yfgybl);

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

    var list = [];
    param = param ? param : "";

    if (param.indexOf(',') != -1) {
      list = param.split(',');
    } else {
      list.push(param);
    }

    return list;

  }

  async getHInfo() {
    var res = await this.stockTradeService.getHInfo(this.detailObj.houseId);
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

    var res = await this.lpbglService.getLjz(id);

    if (res && res.code == 200) {
      this.lpbList = res.msg;
      this.lpbList.dyList.forEach((v, k) => {
        this.rowSpan += v.rowSpan;
      })

    }
  }
  async linkH() {
    if (!this.selectH) {
      this.msg.create("warning", "请先选择户");
      return;
    }

    let res = await this.stockTradeService.linkH(this.detailObj.id, this.selectH);
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
      this.msg.create("success", "关联成功");
    } else {
      this.msg.create("error", "关联失败");
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
    var option = {
      id: this.detailObj.id,
      type: 'htfj'
    }

    var res = await this.fileService.getAttachDicCount(option);
    if (res && res.code == 200) {
      this.fileTypeList = res.msg;
      this.fileType = this.fileTypeList[this.fileTypeIndex].code;
      this.getFileList();
    }

  }

  async getFileList() {
    var option2 = {
      pageNo: this.pageIndex,
      pageSize: this.pageSize,
      conditions: [
        { key: 'refid', value: this.detailObj.id },
        { key: 'type', value: this.fileType }
      ]
    };
    var res = await this.fileService.getFileListByRefidAndType(option2);

    if (res.code == 200) {
      this.fjList = res.msg.currentList;
      this.totalCount = res.msg.recordCount;
    }

    this.calculationHeight();
    this.operateData();
  }

  tabsetChange(m) {
    this.tabsetIndex = m;
  }

  cancel() {
    var route = "/contract/stockTrade";

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
    this.router.navigate([route],{queryParams:{isGoBack:true}});
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

    for (var id in this.mapOfCheckedId) {
      console.log(id)
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

    if (this.jfList.length == 0) {
      this.msg.create('error', '请填写甲方信息');
      return;
    }

    if (this.yfList.length == 0) {
      this.msg.create('error', '请填写乙方信息');
      return;
    }

    if (this.isbusy) {
      this.msg.create('error', '数据正在保存，请勿重复点击');
      return;
    }
    this.isbusy = true;
    this.detailObj.bg = this.bg;

    this.detailObj.jf = "";
    this.detailObj.jflxdz = "";
    this.detailObj.jfzjlx = "";
    this.detailObj.jfzjhm = "";
    this.detailObj.jflxdh = "";
    this.detailObj.jfgyfs = "";
    this.detailObj.jfgybl = "";


    for (let idx = 0; idx < this.jfList.length; idx++) {

      if (idx != this.jfList.length - 1) {
        this.detailObj.jf += this.jfList[idx].jf + ",";
        this.detailObj.jflxdz += this.jfList[idx].jflxdz + ",";
        this.detailObj.jfzjlx += this.jfList[idx].jfzjlx + ",";
        this.detailObj.jfzjhm += this.jfList[idx].jfzjhm + ",";
        this.detailObj.jflxdh += this.jfList[idx].jflxdh + ",";
        this.detailObj.jfgyfs += this.jfList[idx].jfgyfs + ",";
        this.detailObj.jfgybl += this.jfList[idx].jfgybl + ",";

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

    this.detailObj.yf = "";
    this.detailObj.yflxdz = "";
    this.detailObj.yfzjlx = "";
    this.detailObj.yfzjhm = "";
    this.detailObj.yflxdh = "";
    this.detailObj.yfgyfs = "";
    this.detailObj.yfgybl = "";

    for (let idx = 0; idx < this.yfList.length; idx++) {

      if (idx != this.yfList.length - 1) {
        this.detailObj.yf += this.yfList[idx].yf + ",";
        this.detailObj.yflxdz += this.yfList[idx].yflxdz + ",";
        this.detailObj.yfzjlx += this.yfList[idx].yfzjlx + ",";
        this.detailObj.yfzjhm += this.yfList[idx].yfzjhm + ",";
        this.detailObj.yflxdh += this.yfList[idx].yflxdh + ",";
        this.detailObj.yfgyfs += this.yfList[idx].yfgyfs + ",";
        this.detailObj.yfgybl += this.yfList[idx].yfgybl + ",";
      } else {
        this.detailObj.yf += this.yfList[idx].yf ;
        this.detailObj.yflxdz += this.yfList[idx].yflxdz ;
        this.detailObj.yfzjlx += this.yfList[idx].yfzjlx ;
        this.detailObj.yfzjhm += this.yfList[idx].yfzjhm ;
        this.detailObj.yflxdh += this.yfList[idx].yflxdh ;
        this.detailObj.yfgyfs += this.yfList[idx].yfgyfs ;
        this.detailObj.yfgybl += this.yfList[idx].yfgybl ;
      }

    }

    var res = await this.stockTradeService.saveOrUpdateStockTrade(this.detailObj);
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
  }

  calculationHeight() {
    const bodyHeight = $('body').height()
    const height = this.fjList.length * 40;
    if (height > bodyHeight - 440) {
      this.tableIsScroll = { y: bodyHeight - 400 + 'px' }
    } else {
      this.tableIsScroll = null
    }
  }

  upload() {
    this.isVisible = true;
    this.uploadComponent.fileList = [];
  }

  handleCancel() {
    this.isVisible = false;
    this.isOkLoading=false;
    this.uploadComponent.fileList = [];
  }
  isOkLoading=false;
  //开始上传
  handleOk() {
    if(this.isOkLoading){
      this.msg.error('附件正在上传，请勿重复点击');
      return;
    }
    this.isOkLoading=true;
    this.uploadComponent.import();
  }

  outer(event) {
    if (event) {
      this.isOkLoading=false;
      this.handleCancel();
      this.search();
    }
  }

  previewImg(item) {
    if (item.fileSuffix != 'pdf') {
      this.currentImg = this.downLoadurl + "?id=" + item.id + "&type=0";
      this.isImgVisible = true;

      setTimeout(() => {
        var image = new Viewer(document.getElementById('image'),{
          hidden:function(e){
            image.destroy();          }
        });
      }, 200);
    } else {
      window.open(this.downLoadurl + "?id=" + item.id + "&type=0");
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

    var res = await this.fileService.deleteByIds(ids);
    if (res && res.code == 200) {
      this.msg.create('success', '删除成功');
      this.search();
    } else {
      this.msg.create('error', '删除失败');
    }
  }

  //下载
  btachDown(item?) {
    var ids = [];
    if (item) {//单个
      ids.push(item.id);
    } else {//批量
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

    window.location.href = this.downLoadurl + "?id=" + item.id + "&type=0";
  }

  addpeople() {
    if (!this.detailObj.relationShips) {
      this.detailObj.relationShips = [];
    }
    var newpeople = {};
    this.detailObj.relationShips.push(newpeople);
  }

  deletepeople(obj, i) {
    this.detailObj.relationShips.splice(i, 1);
  }

  addJf() {
    if (!this.jfList) {
      this.jfList = [];
    }
    var jf = {
      jf: "",
      jflxdz: "",
      jfzjlx: "",
      jfzjhm: "",
      jflxdh: "",
      jfgyfs: "",
      jfgybl: ""
    }
    this.jfList.push(jf);

  }

  deleteJf(obj, i) {
    this.jfList.splice(i, 1);
  }


  addYf() {
    if (!this.yfList) {
      this.yfList = [];
    }
    var yf = {
      yf: "",
      yflxdz: "",
      yfzjlx: "",
      yfzjhm: "",
      yflxdh: "",
      yfgyfs: "",
      yfgybl: ""
    }
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
    var that = this;
    $(window).resize(function () {
      that.calculationHeight()
    })
  }

}
