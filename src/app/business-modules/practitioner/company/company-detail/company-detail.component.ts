import { Component, OnInit, ViewChildren, QueryList, ViewChild } from '@angular/core';
import { NzMessageService, UploadFile, UploadXHRArgs } from 'ng-zorro-antd';
import { ValidationDirective } from 'src/app/layout/_directives/validation.directive';
import { Router, ActivatedRoute } from '@angular/router';
import { CompanyService } from 'src/app/business-modules/service/practitioner/company.service';
import { Localstorage } from 'src/app/business-modules/service/localstorage';
import { AttachmentSercice } from 'src/app/business-modules/service/common/attachment.service';
import { AttachmentComponent } from 'src/app/layout/_components/attachment/attachment.component';
import { Observable, Observer } from 'rxjs';
import { HttpRequest, HttpEventType, HttpResponse, HttpClient, HttpEvent } from '@angular/common/http';

@Component({
  selector: 'app-company-detail',
  templateUrl: './company-detail.component.html',
  styleUrls: ['./company-detail.component.scss']
})
export class CompanyDetailComponent implements OnInit {

  @ViewChildren(ValidationDirective) directives: QueryList<ValidationDirective>;

  @ViewChild('attachmentComponent', { static: false }) attachmentComponent: AttachmentComponent;

  tabs = [
    { name: '开发企业信息', index: 0 },
    { name: '从业人员管理', index: 1 },
  ]
  tabsetIndex = 0;
  detailObj: any = {};
  parentCode: any = "";
  isDisable: any = false;

  dictionaryObj: any = [];

  companyId: string;
  companyType: string;

  isVisible: any = false;

  fileList: any = [];

  //logo
  showUploadList = {
    showPreviewIcon: true,
    showRemoveIcon: true,
    hidePreviewIconInNonImage: true
  };
  previewImage: string | undefined = '';
  previewVisible = false;
  fileLogoList: any = [];
  uploadFileUrl = AppConfig.Configuration.baseUrl + "/FileInfo/upload";
  preUrl: any = "";

  constructor(
    private msg: NzMessageService,
    private router: Router,
    private companyService: CompanyService,
    private ActivatedRoute: ActivatedRoute,
    private localstorage: Localstorage,
    private attachmentSercice: AttachmentSercice,
    private http: HttpClient
  ) { }

  ngOnInit() {

    this.dictionaryObj = this.localstorage.getObject("dictionary");
    let id = this.ActivatedRoute.snapshot.queryParams["id"];
    this.companyId = id;
    let type = this.ActivatedRoute.snapshot.queryParams["type"];
    this.companyType = type;

    let quit = this.ActivatedRoute.snapshot.queryParams.quit;

    if (quit) {
      this.tabsetIndex = 1;
    }

    if (type == 2) {
      this.isDisable = true;
    }

    if (id) {
      this.getCompanyById(id);
      this.getAtatchment(id);
    }
  }

  async getAtatchment(id) {
    let res = await this.attachmentSercice.getFileListById(id);
    if (res.msg.length > 0) {
      res.msg.forEach(element => {

        if (element.fileType == 1) {
          this.fileLogoList.push({
            uid: element.id,
            name: element.clientFileName
          });

          this.preUrl = AppConfig.Configuration.baseUrl + "/FileInfo/download" + "?id=" + this.fileLogoList[0].uid + "&type=1";
        } else {
          this.fileList.push({
            uid: element.id,
            name: element.clientFileName
          });
        }

      });
    }
  }

  async getCompanyById(id) {

    let data = await this.companyService.getCompanyById(id);
    if (data) {
      this.detailObj = data.msg;
    }
  }

  tabsetChange(m) {
    this.tabsetIndex = m;
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



  async save() {
    if (!this.FormValidation()) {
      return;
    }

    if (this.attachmentComponent.fileList.length == 0) {
      this.msg.create('warning', '请上传资质附件');
      return;
    }

    this.detailObj.companyType = 1;

    this.detailObj.fileInfoList = [];

    this.attachmentComponent.fileList.forEach(element => {
      this.detailObj.fileInfoList.push({ id: element.uid });
    });

    if (this.fileLogoList.length > 0) {
      this.detailObj.fileInfoList.push({ id: this.fileLogoList[0].uid });
    }

    let res = await this.companyService.saveOrUpdateCompany(this.detailObj);

    if (res && res.code == 200) {
      this.detailObj.id = res.msg;
      this.companyId = res.msg;
      this.msg.create('success', '保存成功');
    } else {
      this.msg.create('error', '保存失败');
    }
  }

  quit() {
    this.router.navigate(['/practitioner/company'], {
      queryParams: {

      }
    });
  }

  ngAfterViewInit() {

  }

  //logo

  handleDelete() {
    this.deleteFileLogo(this.fileLogoList[0].uid)
  }

  async deleteFileLogo(id) {
    let data = await this.attachmentSercice.deleteFileById(id);

    if (data.code == 200) {
      this.fileLogoList = [];
    } else {
      this.msg.create('error', '删除失败');
    }
  }

  customReq = (item: UploadXHRArgs) => {

    var that = this;
    // 构建一个 FormData 对象，用于存储文件或其他参数
    const formData = new FormData();
    // tslint:disable-next-line:no-any
    formData.append('files', item.file as any);
    formData.append('refid', this.detailObj.id);
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

            that.msg.success('上传成功');
            that.fileLogoList.push({ uid: res.msg[0] });

            that.preUrl = AppConfig.Configuration.baseUrl + "/FileInfo/download" + "?id=" + that.fileLogoList[0].uid + "&type=1";

          } else {
            this.msg.error(res.msg);
          }

        }

      },
      err => {
      }
    );
  }

}
