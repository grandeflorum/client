import { Component, OnInit, Input } from '@angular/core';

import { EmployeeService } from '../../service/employee/employee.service';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
import { Router , ActivatedRoute} from '@angular/router';
import { Localstorage } from '../../service/localstorage';

@Component({
  selector: 'app-employee-list',
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.scss']
})
export class EmployeeListComponent implements OnInit {

  @Input() module: string;
  @Input() companyId: string;
  @Input() operatorType: string;
  @Input() companyName: String;

  //定义查询条件
  name: string = '';
  cynx: string = '';
  fwjgmc: string = '';
  auditType: string = '';
  sortList: string[] = [];

  //结果展示
  dataSet: any[];
  pageIndex: any = 1;
  pageSize: any = 10;
  totalCount: any;
  Loading = false;

  listOfDisplayData: any[] = [];
  listOfAllData: any[] = [];
  isAllDisplayDataChecked: boolean = false;
  isIndeterminate: boolean = false;
  mapOfCheckedId: { [key: string]: boolean } = {};
  numberOfChecked = 0;
  tableIsScroll = null;
  selectId: string = '';


  constructor(
    private employeeService: EmployeeService,
    private msg: NzMessageService,
    private router: Router,
    private NzModalService: NzModalService,
    private localstorage: Localstorage,
    private ActivatedRoute: ActivatedRoute
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

      if (roles.some(x => x == "默认开发企业") || roles.some(x => x == "默认经纪公司")) {
        this.canzsgc = true;
      }
    }
  }

  ngOnInit() {
    this.getRoles();
    var isGoBack = this.ActivatedRoute.snapshot.queryParams.isGoBack;
    if(isGoBack){
      this.name = this.employeeService.pageCache.name;
      this.cynx = this.employeeService.pageCache.cynx;
      this.fwjgmc = this.employeeService.pageCache.fwjgmc;
      this.auditType = this.employeeService.pageCache.auditType;
      this.selectId = this.employeeService.pageCache.selectId;
      this.pageIndex = this.employeeService.pageCache.pageIndex;
      this.pageSize = this.employeeService.pageCache.pageSize;
    }

    this.search();
  }

  async deleteAll() {
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

  delete(datas) {
    if (datas && datas.length == 0) {
      this.msg.create("warning", "请选择要删除的从业人员");
      return;
    }

    this.NzModalService.confirm({
      nzTitle: '提示', nzContent: '确认删除从业人员', nzOnOk: () => {
        let res = this.employeeService.deleteEmployeeByIds(datas).then(res => {
          if (res && res.code == 200) {
            this.msg.create('success', '删除成功');
            this.search();
          } else {
            this.msg.create('error', '删除失败');
          }
        });
      }
    });


  }

  addEmployee(data, type) {
      this.employeeService.pageCache = {
        name:this.name,
        cynx:this.cynx,
        fwjgmc:this.fwjgmc,
        auditType:this.auditType,
        selectId:data?data.id:'',
        pageIndex:1,
        pageSize:10
    }

    let param = {
      id: data ? data.id : null,
      type: type,
      module: this.module,
      companyId: this.companyId,
      operatorType: this.operatorType,
      companyName: this.companyName
    }

    this.router.navigate(['/practitioner/employee/detail'], {
      queryParams: param
    });
  }

  ngAfterViewInit() {
    var that = this;
    $(window).resize(function () {
      that.alculationHeight()
    })
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

  async search() {
    this.Loading = true;
    let option = {
      pageNo: this.pageIndex,
      pageSize: this.pageSize,
      conditions: []
    };

    if (this.name) {
      option.conditions.push({ key: 'name', value: this.name });
    }
    if (this.cynx) {
      option.conditions.push({ key: 'cynx', value: this.cynx });
    }
    if (this.fwjgmc) {
      option.conditions.push({ key: 'fwjgmc', value: this.fwjgmc });
    }
    if (this.auditType) {
      option.conditions.push({ key: 'auditType', value: this.auditType });
    }
    if (this.module != 'employee') {
      option.conditions.push({ key: 'companyId', value: this.companyId ? this.companyId : 'child' });
    }


    option.conditions.push({ key: 'sort', value: this.sortList });

    let res = await this.employeeService.getEmployeeList(option);

    if (res && res.code == 200) {

      this.dataSet = res.msg.currentList;
      this.totalCount = res.msg.recordCount;
    } else {
      this.msg.create('error', '查询失败');
    }
    this.operateData();
    this.Loading = false;
    this.alculationHeight();
  }

  reset() {
    this.name = '';
    this.cynx = '';
    this.fwjgmc = '';
    this.auditType = '';
    this.pageIndex = 1;
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

  currentPageDataChange($event): void {
    this.listOfDisplayData = $event;
    this.refreshStatus();
  }

  operateData(): void {
    setTimeout(() => {
      this.listOfAllData.forEach(item => (this.mapOfCheckedId[item.id] = false));
      this.refreshStatus();
    }, 1000);
  }

  checkAll(value: boolean): void {
    this.listOfDisplayData.filter(item => !item.disabled).forEach(item => (this.mapOfCheckedId[item.id] = value));
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

  selectItem(data) {
    this.selectId = data.id;
  }

}
