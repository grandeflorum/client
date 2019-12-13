import { Component, OnInit, ViewChild, QueryList } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd';
import { Router } from '@angular/router';
import { KfxmglService } from '../../service/xmgl/kfxmgl.service';
import { Localstorage } from '../../service/localstorage';
import { FileService } from '../../service/file/file.service';
import * as Moment from 'moment';
import * as $ from 'jquery';

@Component({
  selector: 'app-xmscgl',
  templateUrl: './xmscgl.component.html',
  styleUrls: ['./xmscgl.component.scss']
})
export class XmscglComponent implements OnInit {
  @ViewChild('uploadComponent', { static: false }) uploadComponent;

  downLoadurl = AppConfig.Configuration.baseUrl + "/FileInfo/download";

  pageIndex: any = 1;
  totalCount: any;
  pageSize: any = 10;
  Loading = false;
  tableIsScroll = null;
  dataSet: any = [];

  selectId: any = '';
  isVisible = false;


  isAllDisplayDataChecked = false;
  isIndeterminate = false;
  listOfDisplayData = [];
  listOfAllData = [];
  mapOfCheckedId: { [key: string]: boolean } = {};
  numberOfChecked = 0;

  sslm = "";
  txt = "";
  dictionaryObj: any = {};
  isImgVisible = false;
  currentImg = "";
  modalSslm = "";

  constructor(
    private msg: NzMessageService,
    private router: Router,
    private kfxmglService: KfxmglService,
    private localstorage: Localstorage,
    private fileService: FileService
  ) { }

  //添加权限
  canzsgc: boolean = false;
  cantjsh: boolean = false;
  cansh: boolean = false;

  getRoles() {
    let roles = this.localstorage.getObject("roles");

    if (roles) {
      if (roles.some(x => x == '管理员')) {
        this.canzsgc = true;
        this.cantjsh = true;
        this.cansh = true;
      }

      if (roles.some(x => x == '录入员')) {
        this.canzsgc = true;
        this.cantjsh = true;
      }

      if (roles.some(x => x == '审核员')) {
        this.cansh = true;
        this.canzsgc = true;
      }

      if (roles.some(x => x == '领导')) {
        this.canzsgc = true;
      }

      if (roles.some(x => x == '开发企业') || roles.some(x => x == '经济公司')) {
        // this.canzsgc = true;
      }
    }
  }

  ngOnInit() {
    this.getRoles();
    this.dictionaryObj = this.localstorage.getObject("dictionary");
    this.search();
  }

  async search() {
    this.Loading = true;
    let option = {
      pageNo: this.pageIndex,
      pageSize: this.pageSize,
      conditions: [
        { key: 'refid', value: "xmsc" }
      ]
    };

    if (this.sslm) {
      option.conditions.push({ key: 'type', value: this.sslm });
    }

    if (this.txt) {
      option.conditions.push({ key: 'name', value: this.txt });
    }

    console.log(option)

    var res = await this.kfxmglService.getProjectDialog(option);
    this.Loading = false;
    if (res.code == 200) {
      this.dataSet = res.msg.currentList;
      this.totalCount = res.msg.recordCount;
    }

    this.operateData();
    this.calculationHeight();
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
    this.sslm = "";
    this.txt = "";
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




  selectItem(data) {
    this.selectId = data.id;
  }

  add() {
    this.isVisible = true;
  }


  calculationHeight() {
    const bodyHeight = $('body').height()
    const height = this.dataSet.length * 40;
    if (height > bodyHeight - 400) {
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
      this.msg.warning('请选择需要删除的附件');
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



  //批量审核 || 单个审核
  async moreDown(item) {


    var ids = [];

    if (item) {
      ids.push(item.id);
    } else {

    }

    if (ids.length == 0) {
      this.msg.warning('请选择需要下载的项目');
      return;
    }

    this.isVisible = true;
  }


  handleOk() {
    if (this.modalSslm || this.modalSslm == "0") {
      this.uploadComponent.import();
    } else {
      this.msg.warning('请选择所属类别');
    }

  }


  handleCancel() {
    this.isVisible = false;
    this.uploadComponent.fileList = [];
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

  findTypeName(type) {
    var typeName = "";
    this.dictionaryObj.xmsc.forEach((v, k) => {
      if (v.code == type) {
        typeName = v.name
      }
    })

    return typeName;
  }

  ngAfterViewInit() {
    var that = this;
    $(window).resize(function () {
      that.calculationHeight()
    })
  }

}
