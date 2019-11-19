import { Component, OnInit } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd';
import { Router } from '@angular/router';
import { Localstorage } from '../../service/localstorage';
import { ZddyglService } from '../../service/zddygl/zddygl.service';

@Component({
  selector: 'app-zddygl',
  templateUrl: './zddygl.component.html',
  styleUrls: ['./zddygl.component.scss']
})
export class ZddyglComponent implements OnInit {


  pageIndex: any = 1;
  totalCount: any;
  total: any;
  pageSize: any = 10;
  Loading = false;
  tableIsScroll = null;
  dataSet: any = [
  ];
  sortList: any = [];

  selectId: any = '';
  dybdclx = null;
  bdcdyh = '';
  zjjzwzl = '';
  dy_type = "";

  isAllDisplayDataChecked = false;
  isIndeterminate = false;
  listOfDisplayData = [];
  listOfAllData = [];
  mapOfCheckedId: { [key: string]: boolean } = {};
  numberOfChecked = 0;

  dictionaryObj: any = [];
  regionTreeNodes: any = [];

  constructor(
    private msg: NzMessageService,
    private router: Router,
    private localstorage: Localstorage,
    private zddyglService: ZddyglService
  ) { }

  ngOnInit() {

    this.dictionaryObj = this.localstorage.getObject("dictionary");
    let regionList = this.localstorage.getObject("region");
    this.regionTreeNodes = this.generateTree2(regionList, null);
    this.search();
  }


  generateTree2(data, parentCode) {
    const itemArr: any[] = [];
    for (var i = 0; i < data.length; i++) {
      var node = data[i];
      if (node.parentCode == parentCode) {
        let newNode: any;
        newNode = {
          key: node.code,
          title: node.name
        };
        let children = this.generateTree2(data, node.code);
        if (children.length > 0) {
          newNode.children = children;
        } else {
          newNode.isLeaf = true;
        }
        itemArr.push(newNode);
      }
    }
    return itemArr;
  }

  async search() {
    this.Loading = true;
    let option = {
      pageNo: this.pageIndex,
      pageSize: this.pageSize,
      conditions: []
    };

    if (this.dybdclx) {
      option.conditions.push({ key: 'dybdclx', value: this.dybdclx });
    }
    if (this.bdcdyh) {
      option.conditions.push({ key: 'bdcdyh', value: this.bdcdyh });
    }
    if (this.zjjzwzl) {
      option.conditions.push({ key: 'zjjzwzl', value: this.zjjzwzl });
    }
    if (this.dy_type) {
      option.conditions.push({ key: 'dy_type', value: this.dy_type });
    }

    option.conditions.push({ key: 'sort', value: this.sortList });

    let res = await this.zddyglService.getZddyglList(option);

    if (res) {
      this.dataSet = res.msg.currentList;
      this.totalCount = res.msg.recordCount;
    }

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
    this.dybdclx = null;
    this.bdcdyh = '';
    this.zjjzwzl = '';
    this.dy_type = "";
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


  selectItem(data) {
    this.selectId = data.id;
  }

  add(m, item?) {

    this.router.navigate(['/zddygl/detail'], {
      queryParams: {
        id: item ? item.id : '',
        type: m
      }
    });
  }

  async delete(datas) {

    if (datas && datas.length == 0) {
      this.msg.create("warning", "请选择要删除的宗地");
      return;
    }

    let res = await this.zddyglService.deleteZddyglByIds(datas);

    if (res && res.code == 200) {
      this.msg.create('success', '删除成功');
      this.search();
    } else {
      this.msg.create('error', '删除失败');
    }
  }

  btachDelete() {

    let datas = [];

    if (this.listOfDisplayData.length > 0) {
      this.listOfDisplayData.forEach(element => {
        if (this.mapOfCheckedId[element.id]) {
          datas.push(element.id);
        }
      });
    }


    this.delete(datas);

  }

  async restrictedProperty(id) {
    let res = await this.zddyglService.updateZddyTypeById(id, 0);

    if (res && res.code == 200) {
      this.msg.create('success', '注销抵押成功');
      this.search();
    } else {
      this.msg.create('error', '注销抵押失败');
    }
  }

  //排序
  sort(evt) {
    let key = evt.key;

    if (this.sortList.some(x => x.indexOf(key) > -1)) {
      this.sortList.splice(this.sortList.findIndex(x => x.indexOf(key) > -1), 1);
    }

    if (evt.value) {
      if (evt.value == 'ascend') {
        this.sortList.push(key);
      } else if (evt.value == 'descend') {
        this.sortList.push(key + ' desc');
      }
    }

    this.search();
  }


  alculationHeight() {
    const bodyHeight = $('body').height()
    const height = this.dataSet.length * 50;
    if (height > bodyHeight - 400) {
      this.tableIsScroll = { y: bodyHeight - 400 + 'px' }
    } else {
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
