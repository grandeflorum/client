import { Component, OnInit, ViewChildren, QueryList, ViewChild, TemplateRef } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd';
import { Router, ActivatedRoute } from '@angular/router';
import { ValidationDirective } from 'src/app/layout/_directives/validation.directive';
import * as Moment from 'moment';
import * as $ from 'jquery';
import { StockHouseService } from "../../../service/stockHouse/stock-house.service";

@Component({
  selector: 'app-stock-house-detail',
  templateUrl: './stock-house-detail.component.html',
  styleUrls: ['./stock-house-detail.component.scss']
})
export class StockHouseDetailComponent implements OnInit {

  @ViewChildren(ValidationDirective) directives: QueryList<ValidationDirective>;
  @ViewChild('uploadComponent', { static: false }) uploadComponent;

  tabs = [
    { name: '项目信息', index: 0 },
    { name: '附件', index: 1 },
  ]
  tabsetIndex = 0;
  isDisable = false;
  detailId = "";
  detailObj: any = {};
  selectId = -1;
  fjList = [
    { name: "f", scrq: '4545', id: 1 },
    { name: "fsf", scrq: '454', id: 2 },
    { name: "gh", scrq: '554', id: 3 },
    { name: "hk", scrq: '453', id: 4 },
    { name: ";;", scrq: '3234', id: 5 },
    { name: "er", scrq: '24', id: 6 },
    { name: "f", scrq: '4545', id: 1 },
    { name: "fsf", scrq: '454', id: 2 },
    { name: "gh", scrq: '554', id: 3 },
    { name: "hk", scrq: '453', id: 4 },
    { name: ";;", scrq: '3234', id: 5 },
    { name: "er", scrq: '24', id: 6 },
    { name: "f", scrq: '4545', id: 1 },
    { name: "fsf", scrq: '454', id: 2 },
    { name: "gh", scrq: '554', id: 3 },
    { name: "hk", scrq: '453', id: 4 },
    { name: ";;", scrq: '3234', id: 5 },
    { name: "er", scrq: '24', id: 6 }
  ];
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

  constructor(
    private msg: NzMessageService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private stockHouseService: StockHouseService
  ) {

  }

  ngOnInit() {
    var type = this.activatedRoute.snapshot.queryParams.type;
    var id = this.activatedRoute.snapshot.queryParams.id;

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
    if (id) {
     this.getStockHouseById(id);
    }
  }

  async getStockHouseById(id) {

    let data = await this.stockHouseService.getStockHouseById(id);
    if (data) {
      this.detailObj = data.msg;
    }
  }


  tabsetChange(m) {
    this.tabsetIndex = m;
  }
  cancel() {
    this.router.navigate(['/stockHouse']);
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

    let res = await this.stockHouseService.saveOrUpdateStockHouse(this.detailObj);

    if (res && res.code == 200) {
      this.detailObj.id = res.msg;
      this.msg.create('success', '保存成功');
    } else {
      this.msg.create('error', '保存失败');
    }
  }

  calculationHeight() {
    const bodyHeight = $('body').height()
    const height = this.fjList.length * 40;
    if (height > bodyHeight - 400) {
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

  ngAfterViewInit() {
    var that = this;
    $(window).resize(function () {
      that.calculationHeight()
    })
  }

}
