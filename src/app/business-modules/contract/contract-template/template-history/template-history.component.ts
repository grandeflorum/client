import { Component, OnInit, ViewChild } from '@angular/core';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
import { Router, ActivatedRoute } from '@angular/router';
import * as Moment from 'moment';
import * as $ from 'jquery';
import { ContractService } from "../../../service/contract/contract.service";
import { UEditorComponent } from "ngx-ueditor";
import { ContractContentComponent } from "../contract-content/contract-content.component";


@Component({
  selector: 'app-template-history',
  templateUrl: './template-history.component.html',
  styleUrls: ['./template-history.component.scss']
})
export class TemplateHistoryComponent implements OnInit {
  @ViewChild("ueditor", { static: false }) ueditor: UEditorComponent

  pageIndex: any = 1;
  totalCount: any;
  pageSize: any = 10;
  Loading = false;
  tableIsScroll = null;
  selectId: any = '';
  xgr = '';
  xgyy = '';
  xgnr = '';
  dataSet = [];
  id = "";
  config = {
    readonly: true,
    toolbars: [],
    wordCount: false,
    elementPathEnabled: false,
    enableAutoSave: false,
    autoHeightEnabled: false,
    initialFrameWidth: 800,
    initialFrameHeight: 450,
  };
  content = "";
  isVisible = true;


  isAllDisplayDataChecked = false;
  isIndeterminate = false;
  listOfDisplayData = [];
  listOfAllData = [];
  mapOfCheckedId: { [key: string]: boolean } = {};
  numberOfChecked = 0;

  constructor(
    private msg: NzMessageService,
    private nzModalService: NzModalService,
    private router: Router,
    private contractService: ContractService,
    private activateRoute: ActivatedRoute
  ) {
  }

  ngOnInit() {
    this.id = this.activateRoute.snapshot.queryParams.id;
    this.search();
  }

  async search() {
    this.Loading = true;
    let option = {
      pageNo: this.pageIndex,
      pageSize: this.pageSize,
      conditions: []
    };

    if (this.xgr) {
      option.conditions.push({ key: 'xgr', value: this.xgr });
    }
    if (this.xgyy) {
      option.conditions.push({ key: 'xgyy', value: this.xgyy });
    }
    if (this.xgnr) {
      option.conditions.push({ key: 'xgnr', value: this.xgnr });
    }
    if (this.id) {
      option.conditions.push({ key: 'id', value: this.id });
    }
    this.operateData(option);
    this.Loading = false;
    this.calculationHeight();
  }

  back() {
    this.router.navigate(['contract/contractTemplate']);
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
    this.xgr = '';
    this.xgyy = '';
    this.xgnr = '';
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

  async operateData(option) {
    let res = await this.contractService.getContractTemplateHistoryList(option);

    if (res && res.code == 200) {

      this.dataSet = res.msg.currentList;

      this.listOfAllData.forEach(item => (this.mapOfCheckedId[item.id] = false));
      this.refreshStatus();

      this.calculationHeight();
    } else {
      this.msg.create('error', '查询失败');
    }
  }

  selectItem(data) {
    this.selectId = data.id;
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

  async view(item) {
    if (item && item.id) {
      let res = await this.contractService.getContractTemplateHistoryById(item.id);
      if (res && res.code == 200) {
        this.isVisible = true;
        var modal = this.nzModalService.create({
          nzWidth: "850px",
          nzStyle: { height: "545px" },
          nzContent: ContractContentComponent,
          nzTitle: "历史合同详情",
          nzMaskClosable: false,
          nzComponentParams: {
            content:res.msg.content
          },
          nzFooter: [
            {
              label: '关闭',
              shape: 'default',
              onClick: () => modal.destroy()
            }
          ]
        });
      } else {
        this.msg.create("error", "合同历史信息错误，无法查看")
      }
    } else {
      this.msg.create("error", "合同历史信息错误，无法查看")
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
    that.isVisible = false;
  }

}
