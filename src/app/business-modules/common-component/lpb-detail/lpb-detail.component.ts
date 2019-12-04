import { Component, OnInit, Input, Output, EventEmitter ,ViewChildren,QueryList} from '@angular/core';
import { LpbglService } from '../../service/lpbgl/lpbgl.service';
import { Localstorage } from '../../service/localstorage';
import { UtilitiesSercice } from '../../service/common/utilities.services';
import { NzMessageService } from 'ng-zorro-antd';
import { ValidationDirective } from '../../../layout/_directives/validation.directive';

@Component({
  selector: 'app-lpb-detail',
  templateUrl: './lpb-detail.component.html',
  styleUrls: ['./lpb-detail.component.scss']
})
export class LpbDetailComponent implements OnInit {
  @ViewChildren(ValidationDirective) directives: QueryList<ValidationDirective>;
  @Input() glType: string;
  @Input() moduleType:string;
  @Input() isDisable = true;
  @Output() restrictedProperty = new EventEmitter<string>();
  @Output()  saveLjz = new EventEmitter<any>();

  zrzShow: boolean = true;
  detailObj: any = {};
  tabsetIndex2 = 0;
  tabs2 = [];
  lpbList: any = {
    ljzStatistical: {}
  };
  rowSpan = 0;
  dictionaryObj: any = {};
  selectedHu: any = {};
  selectH: string = "1";
  isVisible = false;
  ljzObj:any = {};
  isVisibleC = false;
  cObj:any = {};

  constructor(
    private lpbglService: LpbglService,
    private localstorage: Localstorage,
    private utilitiesSercice:UtilitiesSercice,
    private msg: NzMessageService
  ) { }

  ngOnInit() {
    this.dictionaryObj = this.localstorage.getObject("dictionary");
  }

  init(detailObj) {
    this.tabs2 = [];
    this.detailObj = detailObj;
    if (detailObj && detailObj.ljzList.length>0) {
        //this.tabsetIndex2 = 0;
    
        this.lpbList = detailObj.ljzList[this.tabsetIndex2];

        this.lpbList.dyList.forEach((v, k) => {
          this.rowSpan += v.rowSpan;
        })
  
        detailObj.ljzList.forEach((v, k) => {
          this.tabs2.push({
            name: v.ljzh,
            index: k,
            id: v.id
          })
  
          // if(k == detailObj.ljzList.length - 1&&!this.isDisable){
          //   this.tabs2.push({
          //     name: '添加',
          //     index: k + 1,
          //     id: 0
          //   })
          // }

          
  
      })
      this.tabsetChange2(this.tabsetIndex2)

    }else{
      // if(!this.isDisable){
      //   this.tabs2.push({
      //     name: '添加',
      //     index: 0,
      //     id: 0
      //   })
  
      //   this.tabsetIndex2 = -1;
      // }

    }
  }

  init1(data) {
    this.zrzShow = false;

    this.lpbList = data;

    this.lpbList.dyList.forEach((v, k) => {
      this.rowSpan += v.rowSpan;
    })
  }

  selectedHuChange(item) {
    this.selectedHu = item;
  }


  restrictedProperty1(type) {
    if (this.restrictedProperty) {
      this.restrictedProperty.emit(type);
    }
  }

  tabsetChange2(m) {
    this.tabsetIndex2 = m;
      var id = this.tabs2[m].id;
      this.getLpb(id);
 
  }

  tabClick(){
      this.addLjz(1);
  }

  async getLpb(id) {
    this.rowSpan = 0;

    var res = await this.lpbglService.getLjz(id);

    if (res && res.code == 200) {
      this.lpbList = res.msg;
      this.lpbList.dyList.forEach((v, k) => {
        this.rowSpan += v.rowSpan;
      })

    }
  }

  perview(){
    
    let url = AppConfig.Configuration.baseUrl + "/BuildingTable/printHt?id=" + this.selectedHu.id + "&type="+this.selectedHu.tradeType;
    url = this.utilitiesSercice.wrapUrl(url);
    window.open(url, '_blank');
    
  }

  handleCancel() {
    this.isVisible = false;
    this.isVisibleC = false;
  }

  
  handleOk(m) {
    if(m == 1){//保存逻辑幢
      this.saveOrUpdateLJZ(1);
    }else if(m == 2){//保存层
      this.saveC();
    }
    
  }

  //添加编辑逻辑幢
  async addLjz(m?){
   
    this.ljzObj.ljzh = "",
    this.ljzObj.zcs ="",

  this.ljzObj.scjzmj ="",
  this.ljzObj.fwyt1 =""

    this.isVisible = true;
}

  async saveOrUpdateLJZ(type){
    if(!this.FormValidation()){
      return;
    }
    var option
    if(type == 1){//添加
      option = {
        zrzh:this.detailObj.zrzh,
        ljzh:this.ljzObj.ljzh,
        zcs:this.ljzObj.zcs,
        qxdm:'361129',
        scjzmj:this.ljzObj.scjzmj,
        fwyt1:this.ljzObj.fwyt1
      };
    }else{
      option = this.lpbList
    }
      

    var res = await this.lpbglService.saveOrUpdateLJZ(option);
    if (res && res.code == 200) {
      this.msg.create('success', '保存成功');
      
      this.isVisible = false;
      this.saveLjz.emit();
    } else {
      this.msg.create('error', '保存失败');
    }
  }

  addC(){
    this.cObj.ch = "";
    this.cObj.sjc = "";
    this.isVisibleC = true;
  }

  //保存层
  async saveC() { 
    var option = {
      ljzh: this.tabs2[this.tabsetIndex2].name,
      zrzh:this.detailObj.zrzh,
      sjc:this.cObj.sjc,
      ch:this.cObj.ch,
      qxdm:'361129',
    };
    var res = await this.lpbglService.saveOrUpdateC(option);
    if (res && res.code == 200) {
      this.msg.create('success', '保存成功');
      
      this.isVisibleC = false;
    } else {
      this.msg.create('error', '保存失败');
    }
  }

addH(){

}

  //保存户
  saveH() { }

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
