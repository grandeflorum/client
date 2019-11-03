import { Component, OnInit, ViewChildren, QueryList, ViewChild } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd';
import { ValidationDirective } from 'src/app/layout/_directives/validation.directive';
import { Router, ActivatedRoute } from '@angular/router';
import { CompanyService } from 'src/app/business-modules/service/practitioner/company.service';
import { Localstorage } from 'src/app/business-modules/service/localstorage';
import { AttachmentSercice } from 'src/app/business-modules/service/common/attachment.service';
import { AttachmentComponent } from 'src/app/layout/_components/attachment/attachment.component';

@Component({
  selector: 'app-company-detail',
  templateUrl: './company-detail.component.html',
  styleUrls: ['./company-detail.component.scss']
})
export class CompanyDetailComponent implements OnInit {

  @ViewChildren(ValidationDirective) directives: QueryList<ValidationDirective>;

  @ViewChild('attachmentComponent',{ static: false }) attachmentComponent:AttachmentComponent;

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

  constructor(
    private msg: NzMessageService,
    private router: Router,
    private companyService: CompanyService,
    private ActivatedRoute: ActivatedRoute,
    private localstorage: Localstorage,
    private attachmentSercice: AttachmentSercice
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
        this.fileList.push({
          uid: element.id,
          name: element.clientFileName
        });
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

}
