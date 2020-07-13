import { Component, OnInit } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';
import { ContractQueryService } from '../business-modules/service/contract-query/contract-query.service';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';

@Component({
  selector: 'app-contract-query',
  templateUrl: './contract-query.component.html',
  styleUrls: ['./contract-query.component.scss']
})
export class ContractQueryComponent implements OnInit {

  public type: any = '';
  public data: any = [];
  public id = '';
  public hasData = false;
  public placeholder = '';
  public title = '';
  public isDisable = false;

  constructor(
    private http: HttpClient,
    private contractQueryService: ContractQueryService,
    private msg: NzMessageService
  ) { }

  ngOnInit() {
    setTimeout(() => {
      $('html').css({'min-width': 'unset', 'min-height': 'unset'});
      $('body').css({'min-width': 'unset', 'min-height': 'unset'});
    }, 500);

  }

  typeChange(type) {
    this.type = type;
    this.data = [];
    switch (type) {
      case '1':
        this.placeholder = '请输入身份证号码';
        this.title = '商品房合同查询';
        break;
        case '2':
          this.placeholder = '请输入身份证号码';
          this.title = '存量房合同查询';
          break;
          case '3':
        this.placeholder = '请输入楼盘名称';
        this.title = '预售证查询';
        break;
        case '4':
        this.placeholder = '请输入楼盘名称';
        this.title = '房源查询';
        break;
      default:
        break;
    }
  }

  async QueryHouseTradeByCode() {
    this.hasData = false;
    this.isDisable = true;

    if (this.type == '1') {// 商品房
      const option = {
        Token: 'GanHuTongCrinum',
        IdentityCode: this.id
      };
      const res = await this.contractQueryService.QueryNewHouseTradeByCode(option);
      this.isDisable = false;
      if (res && res.Flag) {
        this.hasData = true;
        this.data = res.Data;


      } else {
        this.msg.create('error', res.Message);
      }


    } else if (this.type == '2') {// 存量房
      const option = {
        Token: 'GanHuTongCrinum',
        IdentityCode: this.id
      };

      const res = await this.contractQueryService.QueryStockHouseTradeByCode(option);
      this.isDisable = false;
      if (res && res.Flag) {
        this.hasData = true;
        this.data = res.Data;

      } else {
        this.msg.create('error', res.Message);
      }

    } else if (this.type == '3') {// 预售证
      const option = {
        Token: 'GanHuTongCrinum',
        LPMC: this.id
      };

      const res = await this.contractQueryService.QueryPresaleByName(option);
      this.isDisable = false;
      if (res && res.Flag) {
        this.hasData = true;
        this.data = res.Data;
      } else {
        this.msg.create('error', res.Message);
      }

    } else if (this.type == '4') {// 预售证
      const option = {
        Token: 'GanHuTongCrinum',
        LPMC: this.id
      };

      const res = await this.contractQueryService.QueryHouseResourceByName(option);
      this.isDisable = false;
      if (res && res.Flag) {
        this.hasData = true;
        this.data = res.Data;
      } else {
        this.msg.create('error', res.Message);
      }

    }


  }

  back() {
    this.type = '';
    this.id = '';
    this.data = [];
  }


}
