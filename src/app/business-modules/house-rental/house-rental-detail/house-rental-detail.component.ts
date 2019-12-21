import { Component, OnInit, ViewChildren, QueryList } from '@angular/core';
import { ValidationDirective } from 'src/app/layout/_directives/validation.directive';
import { NzMessageService } from 'ng-zorro-antd';
import { Router, ActivatedRoute } from '@angular/router';
import { Localstorage } from '../../service/localstorage';
import { HouseRentalService } from '../../service/houserental/houserantal.service';
import { LpbglService } from '../../service/lpbgl/lpbgl.service';

@Component({
  selector: 'app-house-rental-detail',
  templateUrl: './house-rental-detail.component.html',
  styleUrls: ['./house-rental-detail.component.scss']
})
export class HouseRentalDetailComponent implements OnInit {

  @ViewChildren(ValidationDirective) directives: QueryList<ValidationDirective>;

  tabs = [
    { name: '房屋租赁信息', index: 0 },
    { name: '关联户信息', index: 1 }
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

  isbusy = false;

  associatedCompanyShow: boolean = false;

  constructor(
    private msg: NzMessageService,
    private router: Router,
    private houseRentalService: HouseRentalService,
    private ActivatedRoute: ActivatedRoute,
    private localstorage: Localstorage,
    private lpbglService: LpbglService
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
        { name: '房屋租赁信息', index: 0 },
        { name: '关联企业', index: 1 }
      ]

      this.associatedCompanyShow = true;
    } else if (type == 3) {
      this.tabs.push({ name: '关联企业', index: 2 });
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

    let data = await this.houseRentalService.getHouseRentalById(id);
    if (data) {
      this.detailObj = data.msg;

      if (this.detailObj.ljzid) {
        this.selectH = this.detailObj.houseId;
        this.getLpb(this.detailObj.ljzid);
      }
    }
  }

  tabsetChange(m) {
    this.tabsetIndex = m;
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

  FormValidation() {
    let isValid = true;
    this.directives.forEach(d => {
      if (!d.validationValue()) {
        isValid = false;
      }
    });
    return isValid;
  }



  async save() {
    if (!this.FormValidation()) {
      return;
    }

    // if (!this.detailObj.regioncode) {
    //   this.msg.create("warning", "请选择新政区划");
    //   return;
    // }
    if (this.isbusy) {
      this.msg.create('error', '数据正在保存，请勿重复点击');
      return;
    }
    this.isbusy = true;
    let res = await this.houseRentalService.SaveOrUpdateHouseRental(this.detailObj);
    this.isbusy = false;
    if (res && res.code == 200) {
      this.detailObj.id = res.msg;

      if (!this.tabs.some(x => x.index == 2)) {
        this.tabs.push({ name: '关联企业', index: 2 });
      }

      this.quit();
      this.msg.create('success', '保存成功');
    } else {
      this.msg.create('error', '保存失败');
    }
  }

  async linkH() {
    if (!this.selectH) {
      this.msg.create("warning", "请先选择户");
      return;
    }

    let res = await this.houseRentalService.linkH(this.detailObj.id, this.selectH);
    if (res && res.code == 200) {
      this.msg.create("success", "关联成功");
    } else {
      this.msg.create("error", "关联失败");
    }

  }

  quit() {
    this.router.navigate(['/houserental'], {
      queryParams: {
        isGoBack:true
      }
    });
  }

  ngAfterViewInit() {

  }

  selectedHuChange(item) {
    this.selectedHu = item;
  }

}
