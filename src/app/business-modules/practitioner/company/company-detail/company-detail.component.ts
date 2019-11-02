import { Component, OnInit, ViewChildren, QueryList } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd';
import { ValidationDirective } from 'src/app/layout/_directives/validation.directive';
import { Router, ActivatedRoute } from '@angular/router';
import { CompanyService } from 'src/app/business-modules/service/practitioner/company.service';

@Component({
  selector: 'app-company-detail',
  templateUrl: './company-detail.component.html',
  styleUrls: ['./company-detail.component.scss']
})
export class CompanyDetailComponent implements OnInit {

  @ViewChildren(ValidationDirective) directives: QueryList<ValidationDirective>;

  tabs = [
    { name: '开发企业信息', index: 0 },
    { name: '从业人员管理', index: 1 },
  ]
  tabsetIndex = 0;
  detailObj: any = {};
  parentCode: any = "";
  isDisable: any = false;

  constructor(
    private msg: NzMessageService,
    private router: Router,
    private companyService: CompanyService,
    private ActivatedRoute: ActivatedRoute
  ) { }

  ngOnInit() {

    let id = this.ActivatedRoute.snapshot.queryParams["id"];
    let type = this.ActivatedRoute.snapshot.queryParams["type"];

    if (type == 2) {
      this.isDisable = true;
    }

    if (id) {
      this.getCompanyById(id);
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

    this.detailObj.companyType = 1;
    let res = await this.companyService.saveOrUpdateCompany(this.detailObj);

    if (res && res.code == 200) {
      this.detailObj.id = res.msg;
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
