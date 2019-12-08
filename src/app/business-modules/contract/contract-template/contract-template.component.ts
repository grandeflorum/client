import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { NzMessageService, UploadFile, UploadXHRArgs } from 'ng-zorro-antd';
import { HttpRequest, HttpEventType, HttpResponse, HttpClient, HttpEvent } from '@angular/common/http';
import { ContractService } from "../../service/contract/contract.service";
import { Localstorage } from '../../service/localstorage';


@Component({
  selector: 'app-contract-template',
  templateUrl: './contract-template.component.html',
  styleUrls: ['./contract-template.component.scss']
})
export class ContractTemplateComponent implements OnInit {

  config: any;
  downLoadurl = AppConfig.Configuration.baseUrl + "/ContractTemplate/downloadDocByEditor";
  uploadFileUrl = AppConfig.Configuration.baseUrl + "/ContractTemplate/uploadDoc";
  accept = "doc,docx";

  tabs: any = [
    { name: "商品房买卖合同（现售）", idx: 1 },
    { name: "商品房买卖合同（预售）", idx: 2 },
    { name: "存量房买卖合同", idx: 3 }
  ];

  selectIdx = 1;
  selectName = "商品房买卖合同（现售）";

  //模板
  houseTemplateList: any = [
    {
      id: "",
      content: ""
    },
    {
      id: "",
      content: ""
    },
    {
      id: "",
      content: ""
    },
  ];
  houseTemplate = {
    id: "",
    content: ""
  };


  constructor(
    private router: Router,
    private http: HttpClient,
    private msg: NzMessageService,
    private localstorage: Localstorage,
    private contractService: ContractService) { }

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

      if (roles.some(x => x == '开发企业') || roles.some(x => x == '经济公司')) {
        this.canzsgc = true;
      }
    }
  }

  ngOnInit() {

    this.getRoles();


    var that = this;
    setTimeout(() => {
      var ueditorHeight = $('#divheight').height() - 120;
      that.config = {
        readonly: true,
        toolbars: [],
        wordCount: false,
        elementPathEnabled: false,
        enableAutoSave: false,
        autoHeightEnabled: false,
        initialFrameWidth: '100%',
        initialFrameHeight: 410
      };
    }, 100);

    //获取模板
    this.getContractTemplateByType(this.selectIdx);
  }

  tabnumChange(num) {
    this.selectIdx = num + 1;
    this.selectName = this.tabs.filter(function (item) {
      return item.idx == (num + 1);
    })[0].name;

    if (this.houseTemplateList[num].id) {
      this.houseTemplate = this.houseTemplateList[num];
    } else {
      this.getContractTemplateByType(this.selectIdx);
    }

  }

  async getContractTemplateByType(type) {
    var res = await this.contractService.getContractTemplateByType(type);
    if (res && res.code == 200) {
      if (res.msg) {
        this.houseTemplate = res.msg;
      } else {
        this.houseTemplate = {
          id: "",
          content: ""
        };
      }

      this.houseTemplateList[this.selectIdx - 1] = this.houseTemplate;


    } else {
      this.msg.create('error', '获取商品房模板失败');
    }
  }

  vieHistory(item?) {
    var refId = "";
    refId = this.houseTemplate.id;
    if (refId) {
      this.router.navigate(['contract/contractTemplate/history'], {
        queryParams: {
          id: refId,
        }
      });
    }
  }

  //operate:1.查看，2.编辑
  showDetaile(operate) {
    var refId = "";
    refId = this.houseTemplate.id;

    this.router.navigate(['contract/contractTemplate/detaile'], {
      queryParams: {
        id: refId,
        type: this.selectIdx,
        operate: operate,
      }
    });
  }

  customReqHouseTemplate = (item: UploadXHRArgs) => {

    var that = this;
    // 构建一个 FormData 对象，用于存储文件或其他参数
    const formData = new FormData();
    formData.append('files', item.file as any);
    formData.append('id', that.houseTemplate.id);
    formData.append('type', that.selectIdx.toString());


    const req = new HttpRequest('POST', item.action, formData, {
      reportProgress: true,
      withCredentials: false
    });
    this.http.request(req).subscribe(
      (event: HttpEvent<{}>) => {

        if (event instanceof HttpResponse) {
          var res: any = event.body;
          if (res && res.code == 200) {
            this.houseTemplate = res.msg;
            this.houseTemplateList[this.selectIdx - 1] = this.houseTemplate;
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

  beforeUpload = (file: UploadFile): boolean => {
    var fileName = file.name.split('.');
    var fileType = fileName[fileName.length - 1].toLowerCase();
    const isZIP = (fileType == 'doc' || fileType == 'docx');
    if (!isZIP) {
      this.msg.error('请上传doc,docx格式文件');
      return false;
    }
  };

  download() {
    if (this.houseTemplate.id) {
      window.location.href = this.downLoadurl + "?id=" + this.houseTemplate.id + "&title=" + this.selectName;
    }

  }

}
