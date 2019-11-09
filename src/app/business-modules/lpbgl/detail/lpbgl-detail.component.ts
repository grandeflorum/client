import { Component, OnInit, ViewChildren, QueryList , ViewChild , TemplateRef } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd';
import { Router , ActivatedRoute} from '@angular/router';
import { ValidationDirective } from '../../../layout/_directives/validation.directive';
import { Localstorage } from '../../service/localstorage';
import { KfxmglService } from '../../service/xmgl/kfxmgl.service';
import { FileService  } from '../../service/file/file.service';
import { UtilitiesSercice } from '../../service/common/utilities.services';
import { LpbglService } from '../../service/lpbgl/lpbgl.service';
import * as Moment from 'moment';
import * as $ from 'jquery';

@Component({
  selector: 'app-lpbgl-detail',
  templateUrl: './lpbgl-detail.component.html',
  styleUrls: ['./lpbgl-detail.component.scss']
})
export class LpbglDetailComponent implements OnInit {
  @ViewChildren(ValidationDirective) directives: QueryList<ValidationDirective>;
  @ViewChild('uploadComponent',{static:false}) uploadComponent ;

  downLoadurl =  AppConfig.Configuration.baseUrl + "/FileInfo/download";
  tabs = [
    {name:'楼盘信息',index:0},
    {name:'测绘材料',index:1},
  ]
  tabs2 = []
  qsList = [{name:'1',code:'1'},{name:'2',code:'2'}]
  tabsetIndex = 0;
  tabsetIndex2 = 0;
  isDisable = false;
  detailId = "";
  detailObj:any = {};
  selectId = -1;
  fjList = [];
  pageIndex: any = 1;
  totalCount: any = 0;
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
  dictionaryObj:any = {};
  isImgVisible = false;
  currentImg = "";

  lpbList:any = {
    ljzStatistical:{}
  };
  lpbData = ["hasData"];
  selectedHu:any = {};
  rowSpan = 0;
  moduleType = "";

  constructor(
    private msg: NzMessageService,
    private router:Router,
    private activatedRoute:ActivatedRoute,
    private kfxmglService:KfxmglService,
    private localstorage:Localstorage,
    private fileService:FileService,
    private utilitiesSercice:UtilitiesSercice,
    private lpbglService:LpbglService
  ) {
    var type = this.activatedRoute.snapshot.queryParams.type;
    this.detailObj.id = this.activatedRoute.snapshot.queryParams.id;
    this.moduleType = this.activatedRoute.snapshot.queryParams.moduleType;

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
    this.dictionaryObj = this.localstorage.getObject("dictionary");
    if(this.detailObj.id){
      this.getProjectById();
      this.search();
    }


  }

  async getProjectById(){
    var res = await this.lpbglService.getZrz(this.detailObj.id);

    if (res && res.code == 200) {
      this.detailObj=res.msg;

      this.lpbList = this.detailObj.ljzList[0];

      this.lpbList.dyList.forEach((v,k)=>{
        this.rowSpan+=v.rowSpan;
      })

      this.detailObj.ljzList.forEach((v,k)=>{
        this.tabs2.push({
          name: v.mph,
          index: k,
          id:v.id
        })
      })

     } else {
      this.msg.create('error', '内部服务出错');
    }
  }

  selectedHuChange(item){
    this.selectedHu = item;
  }

  async getLpb(id){
    this.rowSpan = 0;
    
      var res = await this.lpbglService.getLjz(id);

      if(res && res.code == 200){
        this.lpbList = res.msg;
        this.lpbList.dyList.forEach((v,k)=>{
          this.rowSpan+=v.rowSpan;
        })

        }
  }

  async search(){
    var res = await this.fileService.getFileListById(this.detailObj.id);
    if(res&& res.code == 200){
      this.fjList = res.msg;
      this.totalCount =  res.msg.length;
    }

    this.calculationHeight();
    this.operateData();
  }

  tabsetChange(m){
    this.tabsetIndex = m;
  }
  tabsetChange2(m){
    console.log(m)
    var id = this.tabs2[m].id;
    this.getLpb(id);
    // this.tabsetIndex2 = m;
  }
  cancel(){
    var route = "/lpbgl";
    
    switch (this.moduleType) {
      case 'dy':
        route = '/zjgcdygl';
        break;
      case 'cf':
        route = '/ycfgl';
        break;
      default:
        break;
    }
    this.router.navigate([route]);
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
    // if(m == 1){
    //   this.detailObj.kgrq = Moment(date).format('YYYY-MM-DD')
    // }else if(m == 2){
    //   this.detailObj.jgrq = Moment(date).format('YYYY-MM-DD')
    // }
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


  async save(){
    if (!this.FormValidation()) {
      return;
    }
    if(!this.detailObj.id){
      delete this.detailObj.id;
    }
    var res = await this.kfxmglService.saveOrUpdateProject(this.detailObj);

    if (res && res.code == 200) {
      this.detailObj.id=res.msg;
      if(!this.detailObj.auditType){
        this.detailObj.auditType=0;
      }
      this.msg.create('success', '保存成功');
    } else {
      this.msg.create('error', '保存失败');
    }
  }

  calculationHeight(){
    const bodyHeight = $('body').height()
    const height = this.fjList.length * 40;
    if(height > bodyHeight - 440){
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

  outer(event){
    if(event){
      this.handleCancel();
      this.search();
    }
  }

  previewImg(item){
    if(item.fileSuffix != 'pdf'){
      this.currentImg = this.downLoadurl + "?id=" + item.id + "&type=0";
      this.isImgVisible = true;
    }else{
      window.open(this.downLoadurl + "?id=" + item.id + "&type=0");
    }

  }

    //删除
    async btachDelete(item?){
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

      var res = await this.fileService.deleteByIds(ids);
      if (res && res.code == 200) {
        this.msg.create('success', '删除成功');
        this.search();
      } else {
        this.msg.create('error', '删除失败');
      }
    }

    //下载
    btachDown(item?){
      var ids = [];
      if (item) {//单个
        ids.push(item.id);
      } else {//批量
        if (this.listOfDisplayData.length > 0) {
          this.listOfDisplayData.forEach(element => {
            if (this.mapOfCheckedId[element.id]) {
              ids.push(element.id);
            }
          });
        }
      }

      if(ids.length==0){
        this.msg.warning('请选择需要下载的项目');
        return;
      }

      window.location.href = this.downLoadurl + "?id=" + item.id + "&type=0";
    }

  ngAfterViewInit() {
    var that = this;
    $(window).resize(function () {
      that.calculationHeight()
    })
  }

}