import { Component, OnInit, ViewChildren, QueryList, ViewChild } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd';
import { Router, ActivatedRoute } from '@angular/router';
import { CompanyService } from 'src/app/business-modules/service/practitioner/company.service';
import { Localstorage } from 'src/app/business-modules/service/localstorage';
import { ValidationDirective } from 'src/app/layout/_directives/validation.directive';
import { AttachmentSercice } from 'src/app/business-modules/service/common/attachment.service';
import { AttachmentComponent } from 'src/app/layout/_components/attachment/attachment.component';

@Component({
  selector: 'app-economic-company-detail',
  templateUrl: './economic-company-detail.component.html',
  styleUrls: ['./economic-company-detail.component.scss']
})
export class EconomicCompanyDetailComponent implements OnInit {

  @ViewChildren(ValidationDirective) directives: QueryList<ValidationDirective>;
  @ViewChild('attachmentComponent', { static: false }) attachmentComponent: AttachmentComponent;

  tabs = [
    { name: '经纪企业信息', index: 0 },
    { name: '从业人员管理', index: 1 },
  ]
  tabsetIndex = 0;
  detailObj: any = {};
  parentCode: any = "";
  isDisable: any = false;

  dictionaryObj: any = [];

  companyId: string;
  companyType: string;

  fileList: any = [];
  regionList: any = [];
  regionTreeNodes: any = [];

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

    this.regionList = this.localstorage.getObject("region");
    this.regionTreeNodes = this.generateTree2(this.regionList, null);

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

  generateTree2(data, parentCode) {
    const itemArr: any[] = [];
    for (var i = 0; i < data.length; i++) {
      var node = data[i];
      if (node.parentCode == parentCode) {
        let newNode: any;
        newNode = {
          key: node.code,
          title: node.name
        };
        let children = this.generateTree2(data, node.code);
        if (children.length > 0) {
          newNode.children = children;
        } else {
          newNode.isLeaf = true;
        }
        itemArr.push(newNode);
      }
    }
    return itemArr;
  }

  async getCompanyById(id) {

    let data = await this.companyService.getCompanyById(id);
    if (data) {
      this.detailObj = data.msg;
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

    this.detailObj.fileInfoList = [];

    this.attachmentComponent.fileList.forEach(element => {
      this.detailObj.fileInfoList.push({ id: element.uid });
    });

    this.detailObj.companyType = 2;

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
    this.router.navigate(['/practitioner/economic'], {
      queryParams: {

      }
    });
  }

  ngAfterViewInit() {

  }

}
