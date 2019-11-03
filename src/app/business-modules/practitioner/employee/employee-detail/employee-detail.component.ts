import { Component, OnInit, QueryList, ViewChildren, ViewChild } from '@angular/core';
import { ValidationDirective } from 'src/app/layout/_directives/validation.directive';
import { Localstorage } from '../../../service/localstorage';
import { EmployeeService } from '../../../service/employee/employee.service';
import { NzMessageService } from 'ng-zorro-antd';
import { ActivatedRoute, Router } from '@angular/router';
import { AttachmentSercice } from 'src/app/business-modules/service/common/attachment.service';

@Component({
  selector: 'app-employee-detail',
  templateUrl: './employee-detail.component.html',
  styleUrls: ['./employee-detail.component.scss']
})
export class EmployeeDetailComponent implements OnInit {
  @ViewChildren(ValidationDirective) directives: QueryList<ValidationDirective>;
  @ViewChild('uploadComponent', { static: false }) uploadComponent;

  employee: any = {};

  isDisable: boolean = false;
  companyId: string;
  operatorType: string;


  genderList: any[] = [];
  educationList: any[] = [];
  zjlbList: any[] = [];
  id: string;
  module: string;

  //附件
  isVisible: any = false;
  fileList: any = [];

  constructor(
    private localstorage: Localstorage,
    private msg: NzMessageService,
    private employeeService: EmployeeService,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private attachmentSercice: AttachmentSercice
  ) {
    var type = this.activatedRoute.snapshot.queryParams.type;
    this.id = this.activatedRoute.snapshot.queryParams.id;
    this.module = this.activatedRoute.snapshot.queryParams.module;
    this.companyId = this.activatedRoute.snapshot.queryParams.companyId;
    this.operatorType = this.activatedRoute.snapshot.queryParams.operatorType;

    this.isDisable = type == 'see';

    if (this.id) {
      this.getViewData();
      this.getAtatchment();
    }
  }

  ngOnInit() {
    this.getDictory();
  }

  async getViewData() {
    let res = await this.employeeService.getEmployeeById(this.id);

    if (res && res.code == 200) {
      this.employee = res.msg;
    } else {
      this.msg.create('error', '从业人员信息获取失败');
    }
  }

  async getAtatchment() {
    let res = await this.attachmentSercice.getFileListById(this.id);
    if (res.msg.length > 0) {
      res.msg.forEach(element => {
        this.fileList.push({
          uid: element.id,
          name: element.clientFileName
        });
      });
    }
  }

  getDictory() {
    let dic = this.localstorage.getObject("dictionary");

    this.genderList = dic.gender;
    this.educationList = dic.education;
    this.zjlbList = dic.zjlb;
  }

  quit() {
    if (this.module == 'employee') {
      this.router.navigate(['/practitioner/employee']);
    } else {
      let data = {
        id: this.companyId,
        type: this.operatorType,
        quit: 1
      }
      this.router.navigate(['/practitioner/' + this.module + '/detail'], {
        queryParams: data
      });
    }
  }


  async save() {
    if (!this.FormValidation()) {
      return;
    }

    if (this.fileList.length == 0) {
      this.msg.create('warning', '请上传资质附件');
      return;
    }
    this.employee.fileInfoList = [];
    this.employee.companyId = this.companyId;

    this.fileList.forEach(element => {
      this.employee.fileInfoList.push({ id: element.uid });
    });

    let res;

    if (this.id) {
      res = await this.employeeService.modifyEmployee(this.employee);
    } else {
      res = await this.employeeService.addEmployee(this.employee);
    }

    if (res.code === 200) {
      this.id = res.msg.id;
      this.employee.id = res.msg.id;
      this.msg.create('success', '保存成功');
    } else {
      this.msg.create('error', res.msg);
    }
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

  /**
   * 附件
   */
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

  uploadCompelete(data) {
    this.fileList = [...this.fileList, ...data];
    this.isVisible = false;

  }

}
