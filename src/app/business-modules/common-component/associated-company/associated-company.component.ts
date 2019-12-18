import { Component, OnInit, ViewChildren, QueryList, Input } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd';
import { Router } from '@angular/router';
import { CompanyService } from '../../service/practitioner/company.service';
import { Localstorage } from '../../service/localstorage';

@Component({
  selector: 'app-associated-company',
  templateUrl: './associated-company.component.html',
  styleUrls: ['./associated-company.component.scss']
})
export class AssociatedCompanyComponent implements OnInit {


  @Input() associatedid: string;
  @Input() modulename: string;
  @Input() selectShow: boolean;

  pageIndex: any = 1;
  totalCount: any;
  total: any;
  pageSize: any = 10;
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

  isVisible: any = false;
  isOkLoading: any = false;


  associatedCompany: any = {};
  associatedType: string = '1';
  associatedCompanyList: any[] = [];
  associatedCompanyType: number = 1;

  constructor(
    private msg: NzMessageService,
    private router: Router,
    private companyService: CompanyService,
    private localstorage: Localstorage,
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
      }

      if (roles.some(x => x == '开发企业') || roles.some(x => x == '经纪公司')) {
        this.canzsgc = true;
      }
    }
  }


  ngOnInit() {
    this.getRoles();
    this.dictionaryObj = this.localstorage.getObject("dictionary");
    this.search();

    this.getAssociatedCompany();
  }

  async getAssociatedCompany() {
    let res = await this.companyService.GetAssociatedCompany(this.associatedid, this.modulename);

    if (res && res.code == 200) {
      if (res.msg) {
        this.associatedCompany = res.msg;

        if (this.associatedCompany.companyid) {
          let comp = await this.companyService.getCompanyById(this.associatedCompany.companyid);

          if (comp && comp.code == 200) {
            this.associatedCompanyType = comp.msg.companyType;
            this.associatedCompanyList = [comp.msg];
          }
        }
      } else {
        this.associatedCompany = {
          id: null,
          companyid: null,
          associatedid: this.associatedid,
          modulename: this.modulename
        }

        this.associatedCompanyList = [];
      }

      this.alculationHeight();
    }
  }

  async associatedCompanyClick(item) {

    this.associatedCompany.companyid = item.id;

    let res = await this.companyService.SaveOrUpdateAssociatedCompany(this.associatedCompany);

    if (res && res.code == 200) {
      this.msg.create("success", "关联成功");
      this.getAssociatedCompany();
    } else {
      this.msg.create("warning", "关联失败");
    }
  }

  async UnAssociatedCompanyClick() {
    let res = await this.companyService.DeleteAssociatedCompany(this.associatedCompany);

    if (res && res.code == 200) {
      this.msg.create("success", "取消关联成功");
      this.getAssociatedCompany();
    } else {
      this.msg.create("warning", "取消关联失败");
    }
  }

  typeChange(evt) {
    this.pageIndex = 1;
    this.associatedType = evt;
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

    option.conditions.push({ key: 'CompanyType', value: this.associatedType });
    option.conditions.push({ key: 'sort', value: this.sortList });

    let res = await this.companyService.getCompanyList(option);

    if (res) {
      this.dataSet = res.msg.currentList;
      this.totalCount = res.msg.recordCount;
      this.total = res.msg.recordCount;
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

    let h = 380;

    if (this.associatedCompanyList && this.associatedCompanyList.length > 0) {
      h = 480;
    }

    const bodyHeight = $('body').height()
    const height = this.dataSet.length * 50;
    if (height > bodyHeight - h) {
      this.tableIsScroll = { y: bodyHeight - h + 'px' }
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


}
