import { Component, OnInit, ViewChildren, QueryList } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd';
import { ValidationDirective } from 'src/app/layout/_directives/validation.directive';
import * as Moment from 'moment';
import * as $ from 'jquery';

@Component({
  selector: 'app-kfxmgl-detail',
  templateUrl: './kfxmgl-detail.component.html',
  styleUrls: ['./kfxmgl-detail.component.scss']
})
export class KfxmglDetailComponent implements OnInit {
  @ViewChildren(ValidationDirective) directives: QueryList<ValidationDirective>;

  tabs = [
    {name:'项目信息',index:0},
    {name:'附件',index:1},
  ]
  tabsetIndex = 0;
  detailObj:any = {};

  constructor(
    private msg: NzMessageService
  ) { }

  ngOnInit() {

  }

  tabsetChange(m){
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



  save(){
    this.FormValidation();
  }

  ngAfterViewInit() {
    
  }

}
