import { Component, OnInit, ViewChildren, QueryList } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd';
import { Router } from '@angular/router';
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
  dataSet: any = [
    {id:'1',disabled:false,xmmc:'aa',kfqymc:'aaa',shzt:'aaaa',kgrq:'aaaaa',jgrq:'aasdad'},
    {id:'2',disabled:false,xmmc:'sdsd',kfqymc:'ukk',shzt:'jkhkhk',kgrq:'ghgh',jgrq:'fhfb'},
    {id:'3',disabled:false,xmmc:'dadfd',kfqymc:'jhk',shzt:'hl',kgrq:'eesff',jgrq:'ffrh'},
    {id:'4',disabled:false,xmmc:'fsff',kfqymc:'hfg',shzt:'lil',kgrq:'hfhgh',jgrq:'ujjj'},
    {id:'1',disabled:false,xmmc:'aa',kfqymc:'aaa',shzt:'aaaa',kgrq:'aaaaa',jgrq:'aasdad'},
    {id:'2',disabled:false,xmmc:'sdsd',kfqymc:'ukk',shzt:'jkhkhk',kgrq:'ghgh',jgrq:'fhfb'},
    {id:'3',disabled:false,xmmc:'dadfd',kfqymc:'jhk',shzt:'hl',kgrq:'eesff',jgrq:'ffrh'},
    {id:'4',disabled:false,xmmc:'fsff',kfqymc:'hfg',shzt:'lil',kgrq:'hfhgh',jgrq:'ujjj'},
    {id:'4',disabled:false,xmmc:'fsff',kfqymc:'hfg',shzt:'lil',kgrq:'hfhgh',jgrq:'ujjj'},
    {id:'4',disabled:false,xmmc:'fsff',kfqymc:'hfg',shzt:'lil',kgrq:'hfhgh',jgrq:'ujjj'}
  ];

  selectId: any = '';
  xmmc = '';
  kfqymc = '';
  shzt = '0';
  kgrq = '';
  jgrq = '';

  isAllDisplayDataChecked = false;
  isIndeterminate = false;
  listOfDisplayData = [];
  listOfAllData = [];
  mapOfCheckedId: { [key: string]: boolean } = {};
  numberOfChecked = 0;

  constructor(
    private msg: NzMessageService,
    private router:Router
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
    if (this.shzt) {
      option.conditions.push({ key: 'shzt', value: this.shzt });
    }
    if (this.kgrq) {
      option.conditions.push({ key: 'kgrq', value: this.kgrq });
    }
    if (this.jgrq) {
      option.conditions.push({ key: 'jgrq', value: this.jgrq });
    }
    console.log(option)
    this.operateData();
    this.Loading = false;
    this.alculationHeight();
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
    this.shzt = '0';
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
    if(m == 1){
      this.kgrq = Moment(date).format('YYYY-MM-DD')
    }else if(m == 2){
      this.jgrq = Moment(date).format('YYYY-MM-DD')
    }
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


  alculationHeight(){
    const bodyHeight = $('body').height()
    const height = this.dataSet.length * 40;
    if(height > bodyHeight - 390){
        this.tableIsScroll = {y: bodyHeight - 390 + 'px'}
    }else{
      this.tableIsScroll = null
    }
  }

  ngAfterViewInit() {
    var that = this;
    $(window).resize(function () {
      that.alculationHeight()
    })
  }

}
