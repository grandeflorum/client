import { Component, OnInit, ViewChildren, QueryList, ViewChild, TemplateRef } from '@angular/core';
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

@Component({
  selector: 'app-house-trade-detail',
  templateUrl: './house-trade-detail.component.html',
  styleUrls: ['./house-trade-detail.component.scss']
})
export class HouseTradeDetailComponent implements OnInit {
  @ViewChildren(ValidationDirective) directives: QueryList<ValidationDirective>;
  @ViewChild('uploadComponent', { static: false }) uploadComponent;

  downLoadurl = AppConfig.Configuration.baseUrl + "/FileInfo/download";
  tabs = [
    { name: '合同信息', index: 0 },
    { name: '附件', index: 1 },
    { name: '关联户信息', index: 2 }
  ]
  tabsetIndex = 0;
  isDisable = false;
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
    var type = this.activatedRoute.snapshot.queryParams.type;
    this.detailObj.id = this.activatedRoute.snapshot.queryParams.id;
    this.moduleType = this.activatedRoute.snapshot.queryParams.moduleType;
    let pid = this.activatedRoute.snapshot.queryParams["pid"];
    this.detailObj.id = pid ? pid : this.detailObj.id;

    let glType = this.activatedRoute.snapshot.queryParams["glType"];
    this.tabsetIndex = glType ? 2 : 0;

    if (type == 2) {
      this.isDisable = true;
      this.tabs = [
        { name: '合同信息', index: 0 },
        { name: '附件', index: 1 },
      ]
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
    }
    this.search();



  }

  async getDetail() {
    var res = await this.houseTradeService.getHouseTradeById(this.detailObj.id);
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


    let res = await this.houseTradeService.linkH(this.detailObj.id, this.selectH);
    if (res && res.code == 200) {
      this.lpbList.cList.forEach(cinfo => {
        if(cinfo&&cinfo.hList.length>0){
          cinfo.hList.forEach(hinfo => {
            if(hinfo.id==this.selectH){
              this.detailObj.dyh=hinfo.dyh;
              this.detailObj.ch=hinfo.ch;
              this.detailObj.fh=hinfo.mph;
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
    if(!this.detailObj.id){
      this.fjList = [];
      this.totalCount = 0;
    }else{
      var res = await this.fileService.getFileListByRefidAndType(option2);

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
    var route = "/contract/houseTrade";

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
    this.router.navigate([route]);
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
    var res = await this.houseTradeService.saveOrUpdateHouseTrade(this.detailObj);

    if (res && res.code == 200) {
      if(!this.detailObj.id){
        this.detailObj.id = res.msg.id;
        this.detailObj.sysDate = res.msg.sysDate;
        this.detailObj.currentStatus = res.msg.currentStatus;
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

  nameChange(){
    if(this.detailObj&&this.detailObj.relationShips&&this.detailObj.relationShips.length>0){
      var name="";
      this.detailObj.relationShips.forEach(element => {
        name+=element.name+",";
      });
      this.detailObj.buyer=name.substring(0,name.length-1);
    }
  }

  ngAfterViewInit() {
    var that = this;
    $(window).resize(function () {
      that.calculationHeight()
    })
  }

}
