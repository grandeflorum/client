import { Component, OnInit, QueryList, ViewChildren, ViewChild } from '@angular/core';
import { Localstorage } from '../../service/localstorage';
import { NzMessageService } from 'ng-zorro-antd';
import { ActivatedRoute, Router } from '@angular/router';
import { ValidationDirective } from 'src/app/layout/_directives/validation.directive';
import { ZddyglService } from '../../service/zddygl/zddygl.service';

@Component({
  selector: 'app-zddygl-detail',
  templateUrl: './zddygl-detail.component.html',
  styleUrls: ['./zddygl-detail.component.scss']
})
export class ZddyglDetailComponent implements OnInit {

  @ViewChildren(ValidationDirective) directives: QueryList<ValidationDirective>;

  tabs = [
    { name: '抵押宗地信息', index: 0 },
    // { name: '楼盘信息', index: 1 }
  ]
  tabsetIndex = 0;
  detailObj: any = {};
  selectedHu: any = {};

  isDisable: any = false;
  dictionaryObj: any = [];
  regionList: any = [];
  regionTreeNodes: any = [];

  sfList: any = [
    { code: 1, name: "是" },
    { code: 2, name: "否" }
  ]

  rowSpan: any = 0;
  lpbList: any = [];
  selectH: any = "";

  constructor(
    private msg: NzMessageService,
    private router: Router,
    private zddyglService: ZddyglService,
    private ActivatedRoute: ActivatedRoute,
    private localstorage: Localstorage
  ) { }

  ngOnInit() {

    this.dictionaryObj = this.localstorage.getObject("dictionary");
    this.regionList = this.localstorage.getObject("region");

    this.regionTreeNodes = this.generateTree2(this.regionList, null);
    let id = this.ActivatedRoute.snapshot.queryParams["id"];
    let type = this.ActivatedRoute.snapshot.queryParams["type"];

    let pid = this.ActivatedRoute.snapshot.queryParams["pid"];
    id = pid ? pid : id;

    let glType = this.ActivatedRoute.snapshot.queryParams["glType"];
    this.tabsetIndex = glType ? 1 : 0;

    if (type == 2) {
      this.isDisable = true;
      this.tabs = [
        { name: '抵押宗地信息', index: 0 }
      ]
    } else if (type == 3 || glType || pid) {
      this.tabs = [
        { name: '抵押宗地信息', index: 0 },
        { name: '楼盘信息', index: 1 }
      ]
    }

    if (id) {
      this.getHouseRentalById(id);
    }
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

  async getHouseRentalById(id) {

    let data = await this.zddyglService.getZddyglById(id);
    if (data) {
      this.detailObj = data.msg;
    }
  }

  tabsetChange(m) {
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


  async linkDyxxByBdcdyh() {
    let res = await this.zddyglService.linkDyxxByBdcdyh(this.detailObj.id, this.detailObj.bdcdyh);

    if (res && res.code == 200) {
      this.msg.create('success', res.msg ? res.msg : "关联成功");
    } else {
      this.msg.create('error', '关联失败');
    }
  }



  async save() {
    if (!this.FormValidation()) {
      return;
    }

    let res = await this.zddyglService.SaveOrUpdateZddygl(this.detailObj);

    if (res && res.code == 200) {
      this.detailObj.id = res.msg;
      this.quit();
      this.msg.create('success', '保存成功');
    } else {
      this.msg.create('error', '保存失败');
    }
  }

  quit() {
    this.router.navigate(['/zddygl'], {
      queryParams: {

      }
    });
  }

  ngAfterViewInit() {

  }

  selectedHuChange(item) {
    this.selectedHu = item;
  }

}
