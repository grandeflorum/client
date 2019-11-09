import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { NzMessageService, UploadFile, UploadXHRArgs } from 'ng-zorro-antd';
import { HttpRequest, HttpEventType, HttpResponse, HttpClient, HttpEvent } from '@angular/common/http';
import { ContractService } from "../../service/contract/contract.service";


@Component({
  selector: 'app-contract-template',
  templateUrl: './contract-template.component.html',
  styleUrls: ['./contract-template.component.scss']
})
export class ContractTemplateComponent implements OnInit {

  config :any;
  downLoadurl = AppConfig.Configuration.baseUrl + "/ContractTemplate/downloadDocByEditor";
  uploadFileUrl = AppConfig.Configuration.baseUrl + "/ContractTemplate/uploadDoc";
  @Input() accept = "doc,docx";

  //商品房模板
  goodsHouseTemplate = {
    id: ""
  };
  //存量房模板
  stockHouseTemplate = {
    id: ""
  };

  constructor(
    private router: Router,
    private http: HttpClient,
    private msg: NzMessageService,
    private contractService: ContractService) { }

  ngOnInit() {
    var ueditorHeight = $('#divheight').height() - 120;
    this.config= {
      readonly: true,
      toolbars: [],
      wordCount: false,
      elementPathEnabled: false,
      enableAutoSave: false,
      autoHeightEnabled: false,
      initialFrameWidth: '100%',
      initialFrameHeight:ueditorHeight
    };
    //获取商品房模板
    this.getContractTemplateByType(1);
    //获取存量房模板
    this.getContractTemplateByType(2);
  }

  async getContractTemplateByType(type) {
    var res = await this.contractService.getContractTemplateByType(type);
    if (res && res.code == 200) {
      if (type == 1) {
        this.goodsHouseTemplate = res.msg;
      } else if (type == 2) {
        this.stockHouseTemplate = res.msg;
      }
    } else {
      this.msg.create('error', '获取商品房模板失败');
    }
  }

  vieHistory(item?) {
    var refId = "";
    if (item == 1) {
      refId = this.goodsHouseTemplate.id;
    } else if (item == 2) {
      refId = this.stockHouseTemplate.id;
    }
    if (refId) {
      this.router.navigate(['contract/contractTemplate/history'], {
        queryParams: {
          id: refId,
        }
      });
    }
  }

  //item:1:商品房，2存量房
  //operate:1.查看，2.编辑
  showDetaile(type, operate) {
    var refId = "";
    if (type == 1) {
      refId = this.goodsHouseTemplate.id;
    } else if (type == 2) {
      refId = this.stockHouseTemplate.id;
    }
    this.router.navigate(['contract/contractTemplate/detaile'], {
      queryParams: {
        id: refId,
        type: type,
        operate: operate,
      }
    });
  }

  customReqGoodsHouseTemplate = (item: UploadXHRArgs) => {

    var that = this;
    // 构建一个 FormData 对象，用于存储文件或其他参数
    const formData = new FormData();
    formData.append('files', item.file as any);
    formData.append('id', this.goodsHouseTemplate.id);
    formData.append('type', "1");


    const req = new HttpRequest('POST', item.action, formData, {
      reportProgress: true,
      withCredentials: false
    });
    this.http.request(req).subscribe(
      (event: HttpEvent<{}>) => {

        if (event instanceof HttpResponse) {
          var res: any = event.body;
          if (res && res.code == 200) {
            this.goodsHouseTemplate=res.msg;
            that.msg.success('上传成功');
          } else {
            this.msg.error('上传失败');
          }

        }

      },
      err => {
      }
    );
  }

  customReqStockHouseTemplate = (item: UploadXHRArgs) => {

    var that = this;
    // 构建一个 FormData 对象，用于存储文件或其他参数
    const formData = new FormData();
    formData.append('files', item.file as any);
    formData.append('id', this.stockHouseTemplate.id);
    formData.append('type', "2");


    const req = new HttpRequest('POST', item.action, formData, {
      reportProgress: true,
      withCredentials: false
    });
    this.http.request(req).subscribe(
      (event: HttpEvent<{}>) => {

        if (event instanceof HttpResponse) {
          var res: any = event.body;
          if (res && res.code == 200) {
            this.stockHouseTemplate=res.msg;
            that.msg.success('上传成功');
          } else {
            this.msg.error('上传失败');
          }

        }

      },
      err => {
      }
    );
  }

  download(type) {
    if (type == 1) {
      if (this.goodsHouseTemplate.id) {
        window.location.href = this.downLoadurl + "?id=" + this.goodsHouseTemplate.id + "&title=" + "商品房模板";
      }
    } else if (type == 2) {
      if (this.stockHouseTemplate.id) {
        window.location.href = this.downLoadurl + "?id=" + this.stockHouseTemplate.id + "&title=" + "存量房模板";
      }
    }
  }

}
