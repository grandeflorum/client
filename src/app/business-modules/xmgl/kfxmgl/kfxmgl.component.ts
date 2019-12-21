import { Component, OnInit, ViewChildren, QueryList } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd';
import { Router , ActivatedRoute} from '@angular/router';
import { KfxmglService } from '../../service/xmgl/kfxmgl.service';
import * as Moment from 'moment';
import * as $ from 'jquery';
import { Localstorage } from '../../service/localstorage';

@Component({
  selector: 'app-kfxmgl',
  templateUrl: './kfxmgl.component.html',
  styleUrls: ['./kfxmgl.component.scss']
})
export class KfxmglComponent implements OnInit {


  pageIndex: any = 1;
  totalCount: any = 0;
  pageSize: any = 10;
  Loading = false;
  tableIsScroll = null;
  dataSet: any = [];
  sortList: any = [];
  selectId: any = '';
  xmmc = '';
  kfqymc = '';
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

  userinfo: any = {};

  constructor(
    private msg: NzMessageService,
    private router: Router,
    private kfxmglService: KfxmglService,
    private localstorage: Localstorage,
    private ActivatedRoute: ActivatedRoute
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

    var isGoBack = this.ActivatedRoute.snapshot.queryParams.isGoBack;

    if(isGoBack){
      this.xmmc = this.kfxmglService.pageCache.xmmc;
      this.kfqymc = this.kfxmglService.pageCache.kfqymc;
      this.auditType = this.kfxmglService.pageCache.auditType;
      this.kgrq = this.kfxmglService.pageCache.kgrq;
      this.jgrq = this.kfxmglService.pageCache.jgrq;
      this.selectId = this.kfxmglService.pageCache.selectId;
      this.pageIndex = this.kfxmglService.pageCache.pageIndex;
      this.pageSize = this.kfxmglService.pageCache.pageSize;
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

    if (this.xmmc) {
      option.conditions.push({ key: 'xmmc', value: this.xmmc });
    }
    if (this.kfqymc) {
      option.conditions.push({ key: 'kfqymc', value: this.kfqymc });
    }
    if (this.auditType || this.auditType === "0") {
      option.conditions.push({ key: 'auditType', value: this.auditType });
    }
    if (this.kgrq) {
      var str = new Date(this.kgrq).getFullYear().toString() + "/" + (new Date(this.kgrq).getMonth() + 1).toString() + "/" + new Date(this.kgrq).getDate().toString() + " 00:00:00";
      option.conditions.push({ key: 'kgrq', value: str });
    }
    if (this.jgrq) {
      var str = new Date(this.jgrq).getFullYear().toString() + "/" + (new Date(this.jgrq).getMonth() + 1).toString() + "/" + new Date(this.jgrq).getDate().toString() + " 23:59:59";
      option.conditions.push({ key: 'jgrq', value: str });
    }
    option.conditions.push({ key: 'sort', value: this.sortList });

    var res = await this.kfxmglService.getProjectList(option);
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
    this.kfqymc = '';
    this.auditType = "";
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

      this.kfxmglService.pageCache = {
        xmmc:this.xmmc,
        kfqymc:this.kfqymc,
        kgrq:this.kgrq,
        jgrq:this.jgrq,
        auditType:this.auditType,
        selectId:item?item.id:'',
        pageIndex:1,
        pageSize:10
    }

    this.router.navigate(['/xmgl/kfxmgl/detail'], {
      queryParams: {
        id: item ? item.id : '',
        type: m
      }
    });
  }


  calculationHeight() {
    const bodyHeight = $('body').height()
    const height = this.dataSet.length * 40;
    if (height > bodyHeight - 450) {
      this.tableIsScroll = { y: bodyHeight - 400 + 'px' }
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
        shrq: new Date()
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
    var res = await this.kfxmglService.auditProjects(this.shxxObj);

    if (res && res.code == 200) {
      this.msg.create('success', '审核成功');
      this.search();
      this.isVisible = false;

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
