import { Component, OnInit, ViewChildren, QueryList, ViewChild, TemplateRef } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd';
import { Router, ActivatedRoute } from '@angular/router';
import { ValidationDirective } from '../../../layout/_directives/validation.directive';
import { Localstorage } from '../../service/localstorage';
import { KfxmglService } from '../../service/xmgl/kfxmgl.service';
import { FileService } from '../../service/file/file.service';
import { UtilitiesSercice } from '../../service/common/utilities.services';
import { LpbglService } from '../../service/lpbgl/lpbgl.service';
import * as Moment from 'moment';
import * as $ from 'jquery';
import { HouseRentalService } from '../../service/houserental/houserantal.service';
import { HouseTradeService } from "../../service/contract/house-trade.service";
import { StockTradeService } from "../../service/contract/stock-trade.service";
import { ZddyglService } from '../../service/zddygl/zddygl.service';
import { StockHouseService } from "../../service/stockHouse/stock-house.service";
import Viewer from 'viewerjs';


@Component({
  selector: 'app-lpbgl-detail',
  templateUrl: './lpbgl-detail.component.html',
  styleUrls: ['./lpbgl-detail.component.scss']
})
export class LpbglDetailComponent implements OnInit {
  @ViewChildren(ValidationDirective) directives: QueryList<ValidationDirective>;
  @ViewChild('uploadComponent', { static: false }) uploadComponent;

  @ViewChild('lpbdetail', { static: false }) lpbdetail;

  downLoadurl = AppConfig.Configuration.baseUrl + "/FileInfo/download";
  tabs = [
    { name: '楼盘信息', index: 0 },
    { name: '测绘材料', index: 1 },
    // { name: '关联企业', index: 2 }
  ]
  tabs2 = []
  qsList = [{ name: '1', code: '1' }, { name: '2', code: '2' }]
  tabsetIndex = 0;
  tabsetIndex2 = 0;
  isDisable = false;
  detailId = "";
  detailObj: any = {};
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

  lpbList: any = {
    ljzStatistical: {}
  };
  lpbData = ["hasData"];
  selectedHu: any = {};
  rowSpan = 0;
  moduleType = "";
  glType = "";
  selectH = "";
  pid = "";
  modalSslm = "";
  //保留查询条件，点击返回时要定位到当前查询条件数据
  option = "";

  constructor(
    private msg: NzMessageService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private kfxmglService: KfxmglService,
    private localstorage: Localstorage,
    private fileService: FileService,
    private utilitiesSercice: UtilitiesSercice,
    private lpbglService: LpbglService,
    private houseRentalService: HouseRentalService,
    private houseTradeService: HouseTradeService,
    private stockTradeService: StockTradeService,
    private zddyglService: ZddyglService,
    private stockHouseService: StockHouseService
  ) {
    var type = this.activatedRoute.snapshot.queryParams.type;
    this.detailObj.id = this.activatedRoute.snapshot.queryParams.id;
    this.moduleType = this.activatedRoute.snapshot.queryParams.moduleType;

    this.glType = this.activatedRoute.snapshot.queryParams.glType;
    this.pid = this.activatedRoute.snapshot.queryParams.pid;
    this.option = this.activatedRoute.snapshot.queryParams.option;

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
      this.getProjectById();
      this.search();
    }


  }

  async getProjectById() {
    var res = await this.lpbglService.getZrz(this.detailObj.id);

    if (res && res.code == 200) {
      this.detailObj = res.msg;

      if (this.lpbdetail) {
        this.lpbdetail.init(res.msg);
      }

      if (this.detailObj.ljzList.length > 0) {
        this.lpbList = this.detailObj.ljzList[0];

        this.lpbList.dyList.forEach((v, k) => {
          this.rowSpan += v.rowSpan;
        })

        this.detailObj.ljzList.forEach((v, k) => {
          this.tabs2.push({
            name: v.mph,
            index: k,
            id: v.id
          })
        })
      }



    } else {
      this.msg.create('error', '内部服务出错');
    }
  }

  selectedHuChange(item) {
    this.selectedHu = item;
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

  async search() {
    var res = await this.fileService.getFileListById(this.detailObj.id);
    if (res && res.code == 200) {
      this.fjList = res.msg;
      this.totalCount = res.msg.length;
    }

    this.calculationHeight();
    this.operateData();
  }

  tabsetChange(m) {
    this.tabsetIndex = m;
  }
  tabsetChange2(m) {
    console.log(m)
    var id = this.tabs2[m].id;
    this.getLpb(id);
    // this.tabsetIndex2 = m;
  }
  cancel() {
    var route = "/lpbgl";

    switch (this.moduleType) {
      case 'dy':
        route = '/zjgcdygl';
        break;
      case 'cf':
        route = '/ycfgl';
        break;
      default:
        break;
    }

    if (this.glType) {

      if (this.glType == "houseRental") {
        route = '/houserental/detail';
      } else if (this.glType == "houseTrade") {
        route = '/contract/houseTrade/detail';
      } else if (this.glType == "stockTrade") {
        route = '/contract/stockTrade/detail';
      } else if (this.glType == 'zddygl') {
        route = '/zddygl/detail';
      } else if (this.glType == "stockHouse") {
        route = '/stockHouse/detail'
      }
      this.router.navigate([route], {
        queryParams: {
          glType: this.glType,
          pid: this.pid
        }
      });

    } else {
      this.router.navigate([route], {
        queryParams: {
          option: this.option,
          selectId: this.detailObj.id
        }
      });
    }

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
    if (!this.lpbdetail.FormValidation()) {
      return;
    }
    var option = JSON.parse(JSON.stringify(this.detailObj));
    if (option && this.lpbdetail && this.lpbdetail.lpbList) {
      option.ljzList = [];
      option.ljzList.push(this.lpbdetail.lpbList);
      option.ljzList.forEach(element => {
        if (element.jgrq) {
          element.jgrq = new Date(element.jgrq).getTime();
        }
      });
    }


    var res = await this.lpbglService.saveOrUpdateZRZandLJZ(option);

    if (res && res.code == 200) {
      this.msg.create('success', '保存成功');
      this.getProjectById();
    } else {
      this.msg.create('error', '保存失败');
    }
  }

  async restrictedProperty(type) {
    let zh;

    if (type == '1') {
      zh = this.detailObj.zrzh;
    } else if (type == '2') {
      zh = this.lpbList.ljzh;
    }

    let res = await this.zddyglService.restrictedProperty(this.pid, zh, type);

    if (res && res.code == 200) {
      this.msg.create('success', '限制成功');
    } else {
      this.msg.create('error', '限制失败');
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

  async linkH() {

    if (this.lpbdetail) {
      this.selectH = this.lpbdetail.selectH;
    }

    if (!this.selectH) {
      this.msg.create("warning", "请先选择户");
      return;
    }

    if (this.glType) {
      let res;
      if (this.glType == "houseRental") {
        res = await this.houseRentalService.linkH(this.pid, this.selectH);
      } else if (this.glType == "houseTrade") {
        res = await this.houseTradeService.linkH(this.pid, this.selectH);
      } else if (this.glType == "stockTrade") {
        res = await this.stockTradeService.linkH(this.pid, this.selectH);
      } else if (this.glType == "stockHouse") {
        if (this.lpbdetail && this.lpbdetail.selectedLJZid) {
          res = await this.stockHouseService.linkH(this.lpbdetail.selectedLJZid, this.pid);
        } else {
          this.msg.create("error", "逻辑幢信息获取出错，关联失败");
          return;
        }
      }

      if (res && res.code == 200) {
        this.msg.create("success", "关联成功");
        if (this.glType == "stockHouse") {
          this.getProjectById();
        }
      } else {
        this.msg.create("error", "关联失败");
      }
    }


  }

  //逻辑幢保存成功
  saveLjz(m) {
    this.getProjectById();
  }



  ngAfterViewInit() {
    var that = this;
    $(window).resize(function () {
      that.calculationHeight()
    })
  }

}
