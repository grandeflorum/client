import { Component, OnInit, ViewChildren, QueryList, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { UEditorComponent } from "ngx-ueditor";
import { ContractService } from "../../../service/contract/contract.service";
// import { UEditorConfig  } from "../../../assets/js/ueditor-config.js";
import { NzMessageService, UploadFile, UploadXHRArgs } from 'ng-zorro-antd';
import { HttpRequest, HttpEventType, HttpResponse, HttpClient, HttpEvent } from '@angular/common/http';
import { Router, ActivatedRoute } from '@angular/router';
import { ValidationDirective } from 'src/app/layout/_directives/validation.directive';

@Component({
  selector: 'app-template-detail',
  templateUrl: './template-detail.component.html',
  styleUrls: ['./template-detail.component.scss']
})
export class TemplateDetailComponent implements OnInit {
  @ViewChildren(ValidationDirective) directives: QueryList<ValidationDirective>;
  @ViewChild("ueditor", { static: false }) ueditor: UEditorComponent
  config: any;
  isVisible = false;
  isDisable = false;
  contractObj = {
    id: "",
    name: "",
    type: "",
    content: "",
    contractTemplateHistory: {
      xgyy: "",
      xgnr: "",
      xgr: ""
    }
  }

  viewconfig = {
    readonly: true,
    toolbars: [],
    wordCount: false,
    elementPathEnabled: false,
    enableAutoSave: false,
    autoHeightEnabled: false,
    initialFrameWidth: '100%',
  };

  editconfig = {
    wordCount: false,
    elementPathEnabled: false,
    enableAutoSave: false,
    autoHeightEnabled: false,
    initialFrameWidth: '100%',
    toolbars: [[
      'fullscreen', 'undo', 'redo', '|',
      'bold', 'italic', 'underline', 'fontborder', 'strikethrough', 'removeformat', 'formatmatch', 'autotypeset', 'blockquote', 'pasteplain', '|', 'forecolor', 'backcolor', 'insertorderedlist', 'insertunorderedlist', 'cleardoc', '|',
      'customstyle', 'paragraph', 'fontfamily', 'fontsize', 'indent', '|',
      'justifyleft', 'justifycenter', 'justifyright', 'justifyjustify', '|',
      'link', 'unlink', '|',
      'emotion', 'scrawl', 'pagebreak', '|',
      'horizontal', 'date', 'time', 'spechars', 'snapscreen', '|',
      'inserttable', 'deletetable', 'insertparagraphbeforetable', 'insertrow', 'deleterow', 'insertcol', 'deletecol', 'mergecells', 'mergeright', 'mergedown', 'splittocells', 'splittorows', 'splittocols', 'charts', '|',
      'print', 'preview', 'searchreplace'
    ]]
  }

  type = "";
  operate = "";
  constructor(
    private contractService: ContractService,
    private http: HttpClient,
    private msg: NzMessageService,
    private router: Router,
    private activateRoute: ActivatedRoute) { }

  ngOnInit() {
    this.contractObj.id = this.activateRoute.snapshot.queryParams.id;
    this.type = this.activateRoute.snapshot.queryParams.type;
    this.operate = this.activateRoute.snapshot.queryParams.operate;
    this.get(this.contractObj.id);
  }

  // ueditorConf = new UEditorConfig();
  async save() {
    if (!this.contractObj.id) {
      this.handleOk();
    } else {
      this.isVisible = true;
    }
  }

  async get(id) {
    if (this.operate == "3") {
      var ueditorHeight = $('#divheight').height() - 30;
      this.config = this.viewconfig;
      this.config.initialFrameHeight = ueditorHeight;
      this.isDisable = true;
    } else {
      var ueditorHeight = $('#divheight').height() - 80;
      this.config = this.editconfig;
      this.config.initialFrameHeight = ueditorHeight;
    }
    let res = await this.contractService.getContractTemplateById(id);
    if (res && res.code == 200) {
      if (res.msg) {
        this.contractObj = res.msg;
        if (this.type == "1") {
          this.contractObj.name = "商品房买卖合同（现售）模板"
        } else if (this.type == "2") {
          this.contractObj.name = "商品房买卖合同（预售）模板"
        } else if (this.type == "3") {
          this.contractObj.name = "存量房合同模板"
        }

        this.contractObj.contractTemplateHistory = {
          xgyy: "",
          xgnr: "",
          xgr: ""
        }
      } else {
        this.contractObj.type = this.type
      }


    }
  }

  cancel() {
    this.router.navigate(['contract/contractTemplate']);
  }

  handleCancel() {
    this.isVisible = false;
  }

  //保存
  async handleOk() {
    //编辑的时候才需要填写修改内容
    if (this.contractObj.id) {
      if (!this.FormValidation()) {
        return;
      }
    }
    var res = await this.contractService.SaveContractTemplate(this.contractObj);
    if (res && res.code == 200) {
      if (!this.contractObj.id) {
        this.contractObj.id = res.msg;
      }
      this.msg.create('success', '保存成功');
      this.isVisible = false;
    } else {
      this.msg.create('error', '保存失败');
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

}
