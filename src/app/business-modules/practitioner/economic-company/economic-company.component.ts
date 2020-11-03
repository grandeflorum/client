import { Component, OnInit, ViewChildren, QueryList } from '@angular/core';
import { ValidationDirective } from 'src/app/layout/_directives/validation.directive';
import { NzMessageService } from 'ng-zorro-antd';
import { Router, ActivatedRoute } from '@angular/router';
import { CompanyService } from '../../service/practitioner/company.service';
import { Localstorage } from '../../service/localstorage';
import { UserService } from '../../service/system/user.service';

@Component({
  selector: 'app-economic-company',
  templateUrl: './economic-company.component.html',
  styleUrls: ['./economic-company.component.scss']
})
export class EconomicCompanyComponent implements OnInit {
  @ViewChildren(ValidationDirective) directives: QueryList<ValidationDirective>;

  pageIndex: any = 1;
  totalCount: any;
  pageSize: any = 10;
  total: any;
  Loading = false;
  tableIsScroll = null;
  dataSet: any = [
  ];
  sortList: any = [];

  selectId: any = '';
  qymc = '';
  qylx = '';
  auditType = '';

  isAllDisplayDataChecked = false;
  isIndeterminate = false;
  listOfDisplayData = [];
  listOfAllData = [];
  mapOfCheckedId: { [key: string]: boolean } = {};
  numberOfChecked = 0;

  dictionaryObj: any = [];
  userinfo: any = {};

  auditList: any = [
    { name: "通过", code: 1 },
    { name: "不通过", code: 2 }
  ];

  //审核对象
  auditObj: any = {
    shrq: new Date()
  };

  isVisible: any = false;
  isOkLoading: any = false;

  auditProjectId: any = [];

  //权限管理
  isVisibleRole: any = false;
  isOkLoadingRole: any = false;

  roleData: any = {};

  arr = ["A", "B", "C", "D", "E", "F", "G", "H", "I", "J", "K", "L", "M", "N", "O", "P", "Q", "R", "S", "T", "U", "V", "W", "X", "Y", "Z",
    "a", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z",
    0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

  constructor(
    private msg: NzMessageService,
    private router: Router,
    private companyService: CompanyService,
    private localstorage: Localstorage,
    private userService: UserService,
    private ActivatedRoute: ActivatedRoute
  ) { }

  //添加权限
  canzsgc: boolean = false;
  cantjsh: boolean = false;
  cansh: boolean = false;
  canecsh: boolean = false;

  qxgl: boolean = false;

  onlybj: boolean = false;

  getRoles() {
    let roles = this.localstorage.getObject("roles");

    if (roles) {
      if (roles.some(x => x == '管理员')) {
        this.canzsgc = true;
        this.cantjsh = true;
        this.qxgl = true;
        this.cansh = true;
        this.canecsh = true;
      }

      if (roles.some(x => x == "默认经纪公司")) {
        this.onlybj = true;
        this.cantjsh = true;
      }

      if (roles.some(x => x == '领导')) {
        this.canecsh = true;
      }

      if (roles.some(x => x == '录入员')) {
        this.canzsgc = true;
        this.cantjsh = true;
        this.qxgl = true;
      }

      if (roles.some(x => x == '审核员')) {
        this.cansh = true;
      }

      if (roles.some(x => x == '开发企业') || roles.some(x => x == '经纪公司')) {
        // this.canzsgc = true;
      }
    }
  }

  ngOnInit() {
    this.getRoles();
    this.dictionaryObj = this.localstorage.getObject("dictionary");
    this.userinfo = JSON.parse(sessionStorage.getItem("userinfo"));
    this.auditObj.shry = this.userinfo ? this.userinfo.realname : null;

    var isGoBack = this.ActivatedRoute.snapshot.queryParams.isGoBack;

    if (isGoBack) {
      this.qymc = this.companyService.pageCache.qymc;
      this.qylx = this.companyService.pageCache.qylx;
      this.auditType = this.companyService.pageCache.auditType;
      this.selectId = this.companyService.pageCache.selectId;
      this.pageIndex = this.companyService.pageCache.pageIndex;
      this.pageSize = this.companyService.pageCache.pageSize;
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

    if (this.qymc) {
      option.conditions.push({ key: 'qymc', value: this.qymc });
    }
    if (this.qylx) {
      option.conditions.push({ key: 'qylx', value: this.qylx });
    }
    if (this.auditType) {
      option.conditions.push({ key: 'auditType', value: this.auditType });
    }

    option.conditions.push({ key: 'CompanyType', value: 2 });
    option.conditions.push({ key: 'sort', value: this.sortList });

    let res = await this.companyService.getCompanyList(option);

    if (res) {
      this.dataSet = res.msg.currentList;
      this.totalCount = res.msg.recordCount;
    }

    this.operateData();
    this.Loading = false;
    this.alculationHeight();
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
    this.qymc = '';
    this.qylx = '';
    this.auditType = '';
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

  add(m, item?) {

    this.companyService.pageCache = {
      qymc: this.qymc,
      qylx: this.qylx,
      auditType: this.auditType,
      selectId: item ? item.id : '',
      pageIndex: 1,
      pageSize: 10
    }

    this.router.navigate(['/practitioner/economic/detail'], {
      queryParams: {
        id: item ? item.id : '',
        type: m
      }
    });
  }

  async delete(datas) {

    if (datas && datas.length == 0) {
      this.msg.create("warning", "请选择要删除的企业");
      return;
    }

    let res = await this.companyService.deleteCompanyByIds(datas);

    if (res && res.code == 200) {
      this.msg.create('success', '删除成功');
      this.search();
    } else {
      this.msg.create('error', '删除失败');
    }
  }

  btachDelete() {

    let datas = [];

    if (this.listOfDisplayData.length > 0) {
      this.listOfDisplayData.forEach(element => {
        if (this.mapOfCheckedId[element.id]) {
          datas.push(element.id);
        }
      });
    }


    this.delete(datas);

  }

  //提交审核
  async auditCompany(id, type) {

    let res = await this.companyService.auditCompanyById(id, type);

    if (res && res.code == 200) {
      this.msg.create('success', '提交审核成功');
      this.search();
    } else {
      this.msg.create('error', '提交审核失败');
    }
  }


  //审核
  audit(data) {

    this.isVisible = true;
    this.isOkLoading = false;

    this.auditProjectId = [];
    this.auditProjectId.push(data.id);

    this.auditObj = {
      shrq: new Date(),
      shry: this.userinfo ? this.userinfo.realname : null
    };

  }

  handleCancel() {
    this.isVisible = false;
  }

  //批量审核
  btachAudit() {
    this.auditProjectId = [];

    let flag = false;
    if (this.listOfDisplayData.length > 0) {
      this.listOfDisplayData.forEach(element => {
        if (this.mapOfCheckedId[element.id]) {
          if (element.auditType != 1) {
            flag = true;
          }
          this.auditProjectId.push(element.id);
        }
      });
    }

    if (this.auditProjectId.length == 0) {

      this.msg.create("warning", "请选择要审核的企业");
      return;
    }

    if (flag) {
      this.msg.create("warning", "只能选择待审核的企业进行审核");
      return;
    }

    this.isVisible = true;
    this.isOkLoading = false;


  }

  //审核保存
  async handleOk() {

    if (!this.FormValidation()) {
      return;
    }

    this.isOkLoading = true;
    var data = {
      ids: this.auditProjectId,
      wfAudit: this.auditObj,
      type: this.twoAuditPD ? 1 : 0
    }

    let res = await this.companyService.btachAuditCompany(data);
    if (res && res.code == 200) {
      this.msg.create('success', '审核成功');
      this.isOkLoading = false;
      this.isVisible = false;
      this.search();

      this.twoAuditPD = false;
    } else {
      this.msg.create('error', '审核失败');
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


  alculationHeight() {
    const bodyHeight = $('body').height()
    const height = this.dataSet.length * 50;
    if (height > bodyHeight - 350) {
      this.tableIsScroll = { y: bodyHeight - 350 + 'px' }
    } else {
      this.tableIsScroll = null
    }
  }

  ngAfterViewInit() {
    var that = this;
    $(window).resize(function () {
      that.alculationHeight()
    })
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

  async rolemanage(data) {

    this.isVisibleRole = true;

    let res = await this.userService.findUserByCard(data.zjh);

    if (res && res.msg && res.code == 200) {

      this.roleData = {
        id: res.msg.id,
        name: data.qymc,
        zjh: res.msg.username,
        password: res.msg.password,
        switchValue: res.msg.isVaild == 1 ? true : false,
        grantValue: res.msg.isGrant == 1 ? true : false
      };
    } else {
      this.roleData = {
        name: data.qymc,
        zjh: data.zjh,
        switchValue: true,
        grantValue: false
      };

      this.roleData.password = this.getPassword();
    }


  }

  getPassword() {
    let password = "";
    for (let i = 0; i < 6; i++) {

      let x = Math.floor((Math.random() * 62));
      password += this.arr[x];
    }

    if (! /^(?=.*[a-zA-Z])(?=.*\d)[^]{6,50}$/.test(password)) {
      return this.getPassword();
    }

    return password;
  }

  async handleOkRole() {

    if (!this.roleData.zjh) {
      this.msg.create("warning", "用户名不能为空");
      return;
    }
    if (!this.roleData.password) {
      this.msg.create("warning", "密码不能为空");
      return;
    }
    // if (this.roleData.password != this.roleData.passwordSure) {
    //   this.msg.create("warning", "确定密码与原密码不一致");
    //   return;
    // }

    let data = {
      id: this.roleData.id,
      username: this.roleData.zjh,
      password: this.roleData.password,
      realname: this.roleData.name,
      isVaild: this.roleData.switchValue ? 1 : 2,
      isGrant: this.roleData.grantValue ? 1 : 0,
      card: this.roleData.zjh
    }

    let resRole = await this.userService.insertRoleManage(data, 2);
    if (resRole && resRole.code == 200) {
      this.msg.create("success", "设置成功");
      this.isVisibleRole = false;
    } else {
      this.msg.create("error", resRole.msg);
    }
  }

  //添加二次审核

  twoAuditPD: boolean = false;

  twoAudit(data) {
    this.twoAuditPD = true;

    this.audit(data);
  }

}
