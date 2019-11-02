import { Component, OnInit, ViewChildren, QueryList , ViewChild , TemplateRef } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd';
import { Router , ActivatedRoute} from '@angular/router';
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
  @ViewChild('uploadComponent',{static:false}) uploadComponent ;

  tabs = [
    {name:'项目信息',index:0},
    {name:'附件',index:1},
  ]
  tabsetIndex = 0;
  isDisable = false;
  detailId = "";
  detailObj:any = {};
  selectId = -1;
  fjList = [
    {name:"f",scrq:'4545',id:1},
    {name:"fsf",scrq:'454',id:2},
    {name:"gh",scrq:'554',id:3},
    {name:"hk",scrq:'453',id:4},
    {name:";;",scrq:'3234',id:5},
    {name:"er",scrq:'24',id:6},
    {name:"f",scrq:'4545',id:1},
    {name:"fsf",scrq:'454',id:2},
    {name:"gh",scrq:'554',id:3},
    {name:"hk",scrq:'453',id:4},
    {name:";;",scrq:'3234',id:5},
    {name:"er",scrq:'24',id:6},
    {name:"f",scrq:'4545',id:1},
    {name:"fsf",scrq:'454',id:2},
    {name:"gh",scrq:'554',id:3},
    {name:"hk",scrq:'453',id:4},
    {name:";;",scrq:'3234',id:5},
    {name:"er",scrq:'24',id:6}
  ];
  pageIndex: any = 1;
  totalCount: any;
  pageSize: any = 10;
  Loading = false;
  tableIsScroll = null;
  isAllDisplayDataChecked = false;
  isIndeterminate = false;
  listOfDisplayData = [];
  listOfAllData = [];
  mapOfCheckedId: { [key: string]: boolean } = {};
  numberOfChecked = 0;
  isVisible = false;

  constructor(
    private msg: NzMessageService,
    private router:Router,
    private activatedRoute:ActivatedRoute
  ) {
    var type = this.activatedRoute.snapshot.queryParams.type;
    var id = this.activatedRoute.snapshot.queryParams.id;

    switch (type) {
      case '1'://添加
        this.isDisable = false;
        break;
      case '2'://查看
        this.isDisable = true;
        break;
      case '3'://编辑
        this.isDisable = false;
        break;
      default:
        break;
    }
    
   }

  ngOnInit() {
    this.search();
  }

  search(){
    this.calculationHeight();
    this.operateData();
  }

  tabsetChange(m){
    this.tabsetIndex = m;
  }
  cancel(){
    this.router.navigate(['/xmgl/kfxmgl']);
  }

  pageIndexChange(num) {
    this.pageIndex = num;
    this.search();
  }

  pageSizeChange(num) {
    this.pageSize = num;
    this.pageIndex = 1;
    this.search();
  }

  currentPageDataChange($event): void {
    this.listOfDisplayData = $event;
    this.refreshStatus();
  }

  refreshStatus(): void {
    this.isAllDisplayDataChecked = this.listOfDisplayData
      .filter(item => !item.disabled)
      .every(item => this.mapOfCheckedId[item.id]);
    this.isIndeterminate =
      this.listOfDisplayData.filter(item => !item.disabled).some(item => this.mapOfCheckedId[item.id]) &&
      !this.isAllDisplayDataChecked;
    this.numberOfChecked = this.listOfAllData.filter(item => this.mapOfCheckedId[item.id]).length;

    for(var id in this.mapOfCheckedId){
        console.log(id)
    }
  }

  checkAll(value: boolean): void {
    this.listOfDisplayData.filter(item => !item.disabled).forEach(item => (this.mapOfCheckedId[item.id] = value));
    this.refreshStatus();
  }

  operateData(): void {
    setTimeout(() => {
      this.listOfAllData.forEach(item => (this.mapOfCheckedId[item.id] = false));
      this.refreshStatus();
    }, 1000);
  }


  onChange(m,date){
    if(m == 1){
      this.detailObj.kgrq = Moment(date).format('YYYY-MM-DD')
    }else if(m == 2){
      this.detailObj.jgrq = Moment(date).format('YYYY-MM-DD')
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

  selectItem(data) {
    this.selectId = data.id;
  }


  save(){
    this.FormValidation();
  }

  calculationHeight(){
    const bodyHeight = $('body').height()
    const height = this.fjList.length * 40;
    if(height > bodyHeight - 400){
        this.tableIsScroll = {y: bodyHeight - 400 + 'px'}
    }else{
      this.tableIsScroll = null
    }
  }

  upload(){
    this.isVisible = true;
    this.uploadComponent.fileList = [];
  }

  handleCancel(){
    this.isVisible = false;
    this.uploadComponent.fileList = [];
  }

//开始上传
  handleOk(){
    this.uploadComponent.import();
  }

  ngAfterViewInit() {
    var that = this;
    $(window).resize(function () {
      that.calculationHeight()
    })
  }

}
