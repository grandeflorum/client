import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { LpbglService } from '../../service/lpbgl/lpbgl.service';
import { Localstorage } from '../../service/localstorage';

@Component({
  selector: 'app-lpb-detail',
  templateUrl: './lpb-detail.component.html',
  styleUrls: ['./lpb-detail.component.scss']
})
export class LpbDetailComponent implements OnInit {

  @Input() glType: string;
  @Output() restrictedProperty = new EventEmitter<string>();

  zrzShow: boolean = true;
  detailObj: any = {};
  tabsetIndex2 = 0;
  tabs2 = [];
  isDisable = true;
  lpbList: any = {
    ljzStatistical: {}
  };
  rowSpan = 0;
  dictionaryObj: any = {};
  selectedHu: any = {};
  selectH: string;

  constructor(
    private lpbglService: LpbglService,
    private localstorage: Localstorage,
  ) { }

  ngOnInit() {
    this.dictionaryObj = this.localstorage.getObject("dictionary");
  }

  init(detailObj) {
    this.detailObj = detailObj;
    if (detailObj && detailObj.ljzList) {
      this.lpbList = detailObj.ljzList[0];

      this.lpbList.dyList.forEach((v, k) => {
        this.rowSpan += v.rowSpan;
      })

      detailObj.ljzList.forEach((v, k) => {
        this.tabs2.push({
          name: v.mph,
          index: k,
          id: v.id
        })
      })
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
    console.log(m)
    var id = this.tabs2[m].id;
    this.getLpb(id);
    // this.tabsetIndex2 = m;
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

}
