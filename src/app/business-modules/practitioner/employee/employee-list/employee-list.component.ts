import { Component, OnInit, Input } from '@angular/core';

import { EmployeeService } from '../../../service/employee/employee.service';
import { NzMessageService } from 'ng-zorro-antd';

@Component({
  selector: 'app-employee-list',
  templateUrl: './employee-list.component.html',
  styleUrls: ['./employee-list.component.scss']
})
export class EmployeeListComponent implements OnInit {

  @Input() module: string;
  @Input() companyId: string;

  //定义查询条件
  name: string = '';
  cynx: string = '';
  fwjgmc: string = '';
  auditType: string = '';
  desc: string[] = [];
  asc: string[] = [];

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
  ) { }

  ngOnInit() {
    this.search();
  }

  ngAfterViewInit() {
    var that = this;
    $(window).resize(function () {
      that.alculationHeight()
    })
  }

  alculationHeight() {
    const bodyHeight = $('body').height()
    const height = this.dataSet.length * 40;
    if (height > bodyHeight - 390) {
      this.tableIsScroll = { y: bodyHeight - 390 + 'px' }
    } else {
      this.tableIsScroll = null
    }
  }

  async search() {
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
    if (this.companyId) {
      option.conditions.push({ key: 'companyId', value: this.companyId });
    }

    option.conditions.push({ key: 'desc', value: this.desc });
    option.conditions.push({ key: 'asc', value: this.asc });

    let res = await this.employeeService.getEmployeeList(option);

    if (res && res.code == 200) {

      this.dataSet = res.msg;

      this.listOfAllData.forEach(item => (this.mapOfCheckedId[item.id] = false));
      this.refreshStatus();

      this.alculationHeight();
    } else {
      this.msg.create('error', '查询失败');
    }

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
