import { Component, OnInit, ViewChildren, QueryList } from '@angular/core';
import { ValidationDirective } from 'src/app/layout/_directives/validation.directive';
import { NzMessageService } from 'ng-zorro-antd';
import { Router, ActivatedRoute } from '@angular/router';
import { Localstorage } from '../../service/localstorage';
import { HouseRentalService } from '../../service/houserental/houserantal.service';

@Component({
  selector: 'app-house-rental-detail',
  templateUrl: './house-rental-detail.component.html',
  styleUrls: ['./house-rental-detail.component.scss']
})
export class HouseRentalDetailComponent implements OnInit {

  @ViewChildren(ValidationDirective) directives: QueryList<ValidationDirective>;

  tabs = [
    { name: '房屋租赁信息', index: 0 },
  ]
  tabsetIndex = 0;
  detailObj: any = {};

  isDisable: any = false;
  dictionaryObj: any = [];
  regionList: any = [];
  regionTreeNodes: any = [];

  sfList: any = [
    { code: 1, name: "是" },
    { code: 2, name: "否" }
  ]

  constructor(
    private msg: NzMessageService,
    private router: Router,
    private houseRentalService: HouseRentalService,
    private ActivatedRoute: ActivatedRoute,
    private localstorage: Localstorage
  ) { }

  ngOnInit() {

    this.dictionaryObj = this.localstorage.getObject("dictionary");
    this.regionList = this.localstorage.getObject("region");

    this.regionTreeNodes = this.generateTree2(this.regionList, null);
    let id = this.ActivatedRoute.snapshot.queryParams["id"];
    let type = this.ActivatedRoute.snapshot.queryParams["type"];

    if (type == 2) {
      this.isDisable = true;
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



  async save() {
    if (!this.FormValidation()) {
      return;
    }

    if (!this.detailObj.regioncode) {
      this.msg.create("warning", "请选择新政区划");
      return;
    }
    let res = await this.houseRentalService.SaveOrUpdateHouseRental(this.detailObj);

    if (res && res.code == 200) {
      this.detailObj.id = res.msg;
      this.quit();
      this.msg.create('success', '保存成功');
    } else {
      this.msg.create('error', '保存失败');
    }
  }

  quit() {
    this.router.navigate(['/houserental'], {
      queryParams: {

      }
    });
  }

  ngAfterViewInit() {

  }

}
