import { Component, OnInit, ViewChild } from '@angular/core';
import { UEditorComponent } from 'ngx-ueditor';
import { ContractService } from 'src/app/business-modules/service/contract/contract.service';
import { HttpClient } from '@angular/common/http';
import { NzMessageService } from 'ng-zorro-antd';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-trade-edit',
  templateUrl: './trade-edit.component.html',
  styleUrls: ['./trade-edit.component.scss']
})
export class TradeEditComponent implements OnInit {

  @ViewChild("ueditor", { static: false }) ueditor: UEditorComponent

  contractObj = {
    tradeId: "",
    content: ""
  }

  config:any = {
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

  type:any =  "";

  constructor(
    private contractService: ContractService,
    private http: HttpClient,
    private msg: NzMessageService,
    private router: Router,
    private activateRoute: ActivatedRoute) { }

  ngOnInit() {

    this.contractObj.tradeId = this.activateRoute.snapshot.queryParams.id;
    this.type = this.activateRoute.snapshot.queryParams.type;

    this.get(this.contractObj.tradeId);

  }

  async save() {
    let res = await this.contractService.saveTradeEdit(this.contractObj);
    if (res && res.code == 200) {
      this.contractObj = res.msg;
      this.msg.create('success', '保存成功');
    }else{
      this.msg.create('error', '保存失败');
    }
  }

  async get(id) {

    var ueditorHeight = $('#divheight').height() - 80;
    this.config.initialFrameHeight = ueditorHeight;

    let res = await this.contractService.getTradeEditByTradeId(id,this.type);
    if (res && res.code == 200) {
      this.contractObj = res.msg;
    }


  }

  cancel() {
    var url ;

    if(this.type == "house-trade"){
      url = "/contract/houseTrade";
    }
    this.router.navigate([url],{queryParams:{isGoBack:true}});
  }




}
