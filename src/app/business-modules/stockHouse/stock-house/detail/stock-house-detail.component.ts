import { Component, OnInit, ViewChildren, QueryList, ViewChild, TemplateRef } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd';
import { Router, ActivatedRoute } from '@angular/router';
import { ValidationDirective } from 'src/app/layout/_directives/validation.directive';
import * as Moment from 'moment';
import * as $ from 'jquery';
import { StockHouseService } from "../../../service/stockHouse/stock-house.service";
import { Localstorage } from '../../../service/localstorage';
import { FileService } from '../../../service/file/file.service';

@Component({
  selector: 'app-stock-house-detail',
  templateUrl: './stock-house-detail.component.html',
  styleUrls: ['./stock-house-detail.component.scss']
})
export class StockHouseDetailComponent implements OnInit {

  @ViewChildren(ValidationDirective) directives: QueryList<ValidationDirective>;
  @ViewChild('uploadComponent', { static: false }) uploadComponent;
  downLoadurl = AppConfig.Configuration.baseUrl + "/FileInfo/download";
  tabs = [
    { name: '项目信息', index: 0 },
    { name: '附件', index: 1 },
  ]
  tabsetIndex = 0;
  isDisable = false;
  detailId = "";
  detailObj: any = {
    relationShips: []
  };
  selectId = -1;
  fjList = [];
  pageIndex: any = 1;
  totalCount: any;
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
  genderList = [];
  fxList=[];
  cqrgxList=[];

  isImgVisible = false;
  currentImg = "";

  constructor(
    private msg: NzMessageService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private stockHouseService: StockHouseService,
    private localstorage: Localstorage,
    private fileService: FileService
  ) {
    var type = this.activatedRoute.snapshot.queryParams.type;
    this.detailObj.id = this.activatedRoute.snapshot.queryParams.id;

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

    this.getDictory();
    if (this.detailObj.id) {
      this.getStockHouseById();
      this.search();
    }
  }

  getDictory() {
    let dic = this.localstorage.getObject("dictionary");

    this.genderList = dic.gender;
    this.fxList=dic.fx;
    this.cqrgxList=dic.cqrgx;
  }

  async getStockHouseById() {

    let data = await this.stockHouseService.getStockHouseById(this.detailObj.id);
    if (data&&data.code==200) {
      this.detailObj = data.msg;
      if (!this.detailObj.relationShips) {
        this.detailObj.relationShips = [];
      }
    } else {
      this.msg.create('error', '内部服务出错');
    }
  }

  async search() {
    var res = await this.fileService.getFileListById(this.detailObj.id);
    if (res && res.code == 200) {
      this.fjList = res.msg;
    }

    this.calculationHeight();
    this.operateData();
  }


  tabsetChange(m) {
    this.tabsetIndex = m;
  }
  cancel() {
    this.router.navigate(['/stockHouse']);
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
    if(!this.detailObj.id){
      delete this.detailObj.id;
    }
    let res = await this.stockHouseService.saveOrUpdateStockHouse(this.detailObj);

    if (res && res.code == 200) {
      this.detailObj.id = res.msg;
      if(!this.detailObj.auditType){
        this.detailObj.auditType=0;
      }
      this.msg.create('success', '保存成功');
    } else {
      this.msg.create('error', '保存失败');
    }
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
    this.uploadComponent.fileList = [];
  }

  //开始上传
  handleOk() {
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


  ngAfterViewInit() {
    var that = this;
    $(window).resize(function () {
      that.calculationHeight()
    })
  }

}
