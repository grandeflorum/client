import { Component, OnInit, ViewChildren, QueryList } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd';
import { Router } from '@angular/router';
import { KfxmglService } from '../../service/xmgl/kfxmgl.service';
import * as Moment from 'moment';
import * as $ from 'jquery';

@Component({
  selector: 'app-kfxmgl',
  templateUrl: './kfxmgl.component.html',
  styleUrls: ['./kfxmgl.component.scss']
})
export class KfxmglComponent implements OnInit {


  pageIndex: any = 1;
  totalCount: any;
  pageSize: any = 10;
  Loading = false;
  tableIsScroll = null;
  dataSet: any = [];

  selectId: any = '';
  xmmc = '';
  kfqymc = '';
  auditType ="";
  kgrq = '';
  jgrq = '';
  isVisible = false;

  shxxObj:any = {
    ids:[],
    wfAudit:{
      shjg:"1",
      shry:'',
      bz:'',
      shrq:null
    }
  }
  isAllDisplayDataChecked = false;
  isIndeterminate = false;
  listOfDisplayData = [];
  listOfAllData = [];
  mapOfCheckedId: { [key: string]: boolean } = {};
  numberOfChecked = 0;

  constructor(
    private msg: NzMessageService,
    private router:Router,
    private kfxmglService:KfxmglService
  ) { }

  ngOnInit() {

    this.search();
  }

  async search() {
    this.Loading = true;
    let option = {
      pageNo: this.pageIndex,
      pageSize: this.pageSize,
      conditions: []
    };

    if (this.xmmc) {
      option.conditions.push({ key: 'xmmc', value: this.xmmc });
    }
    if (this.kfqymc) {
      option.conditions.push({ key: 'kfqymc', value: this.kfqymc });
    }
    if (this.auditType||this.auditType==="0") {
      option.conditions.push({ key: 'auditType', value: this.auditType });
    }
    if (this.kgrq) {
      option.conditions.push({ key: 'kgrq', value: this.kgrq });
    }
    if (this.jgrq) {
      option.conditions.push({ key: 'jgrq', value: this.jgrq });
    }
    console.log(option)

    var res = await this.kfxmglService.getProjectList(option);
    this.Loading = false;
    if(res.code == 200){
      this.dataSet = res.msg.currentList;
      this.totalCount = res.msg.recordCount;
      this.calculationHeight();
    }

    this.operateData();
    
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

  reset() { 
    this.xmmc = '';
    this.kfqymc = '';
    this.auditType ="0";
    this.kgrq = '';
    this.jgrq = '';
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
    // if(m == 1){
    //   this.kgrq = Moment(date).format('YYYY-MM-DD')
    // }else if(m == 2){
    //   this.jgrq = Moment(date).format('YYYY-MM-DD')
    // }
  }

selectItem(data) {
    this.selectId = data.id;
  }

  add(m , item?){
    // switch (m) {
    //   case 1://添加
    //     break;
    //     case 2://查看
    //     break;
    //     case 3://编辑
    //     break;
    //   default:
    //     break;
    // }

    this.router.navigate(['/xmgl/kfxmgl/detail'], {
      queryParams: {
        id: item?item.id:'',
        type:m
      }
    });
  }


  calculationHeight(){
    const bodyHeight = $('body').height()
    const height = this.dataSet.length * 40;
    if(height > bodyHeight - 400){
        this.tableIsScroll = {y: bodyHeight - 400 + 'px'}
    }else{
      this.tableIsScroll = null
    }
  }

  //删除
  async btachDelete(item){
    var ids = [];
    if (item) {//单个删除
      ids.push(item.id);
    } else {//批量删除
      if (this.listOfDisplayData.length > 0) {
        this.listOfDisplayData.forEach(element => {
          if (this.mapOfCheckedId[element.id]) {
            ids.push(element.id);
          }
        });
      }
    }

    if(ids.length==0){
      this.msg.warning('请选择需要删除的项目');
      return;
    }

    var res = await this.kfxmglService.deleteProjectByIds(ids);
    if (res && res.code == 200) {
      this.msg.create('success', '删除成功');
      this.search();
    } else {
      this.msg.create('error', '删除失败');
    }
  }

  //提交审核
 async auditSubmit(item , type){
    var res = await this.kfxmglService.auditProjectById(item.id , type);
    if (res && res.code == 200) {
      this.msg.create('success', '提交审核成功');
      this.search();
    } else {
      this.msg.create('error', '提交审核失败');
    }
  }

  //批量审核 || 单个审核
 async moreAudit(item){
  
  this.shxxObj = {
    ids:[],
    wfAudit:{
      shjg:"1",
      shry:'',
      bz:'',
      shrq:null
    }
  }
   this.shxxObj.ids = [];

    if(item){
      this.shxxObj.ids.push(item.id);
    }else{
      if (this.listOfDisplayData.length > 0) {
        this.listOfDisplayData.forEach(element => {
          if (this.mapOfCheckedId[element.id]) {
            this.shxxObj.ids.push(element.id);
          }
        });
      }
    }

    if(this.shxxObj.ids.length == 0){
      this.msg.warning('请选择需要审核的项目');
      return;
    }

    this.isVisible = true;
}

  //打开审核模态框
  shxm(){
    this.isVisible = true;
    this.shxxObj = {
      ids:[],
      wfAudit:{
        shjg:"1",
        shry:'',
        bz:'',
        shrq:null
      }
    }
  }

    //审核
  async handleOk(){
    var res = await this.kfxmglService.auditProjects(this.shxxObj);

    if (res && res.code == 200) {
      this.msg.create('success', '审核成功');
      this.search();
      this.isVisible = false;
    } else {
      this.msg.create('error', '审核失败');
    }
  }


  handleCancel(){
    this.isVisible = false;
  }

  ngAfterViewInit() {
    var that = this;
    $(window).resize(function () {
      that.calculationHeight()
    })
  }

}
