import { Component, OnInit } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd';
import { Router } from '@angular/router';
import * as Moment from 'moment';
import * as $ from 'jquery';
import { CompanyService } from '../../service/practitioner/company.service';
import { Localstorage } from '../../service/localstorage';

@Component({
  selector: 'app-company',
  templateUrl: './company.component.html',
  styleUrls: ['./company.component.scss']
})
export class CompanyComponent implements OnInit {

  pageIndex: any = 1;
  totalCount: any;
  pageSize: any = 10;
  Loading = false;
  tableIsScroll = null;
  dataSet: any = [
  ];

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

  constructor(
    private msg: NzMessageService,
    private router: Router,
    private companyService: CompanyService,
    private localstorage: Localstorage
  ) { }

  ngOnInit() {

    this.dictionaryObj = this.localstorage.getObject("dictionary");
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

    option.conditions.push({ key: 'CompanyType', value: 1 });
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

    this.router.navigate(['/practitioner/company/detail'], {
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

  async auditCompany(id, type) {

    let res = await this.companyService.auditCompanyById(id, type);

    if (res && res.code == 200) {
      this.msg.create('success', '提交审核成功');
      this.search();
    } else {
      this.msg.create('error', '提交审核失败');
    }
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

  ngAfterViewInit() {
    var that = this;
    $(window).resize(function () {
      that.alculationHeight()
    })
  }

}
