import { Component, OnInit } from '@angular/core';
import { HouseTradeService } from '../../service/contract/house-trade.service';

@Component({
  selector: 'app-ewm-check',
  templateUrl: './ewm-check.component.html',
  styleUrls: ['./ewm-check.component.scss']
})
export class EwmCheckComponent implements OnInit {

  type: any = "";
  id: any = "";
  data: any = {};

  constructor(private houseTradeService: HouseTradeService) { }

  ngOnInit() {

    var query = window.location.hash;
    query = query.split("?")[1];

    var params = query.split("&");
    this.id = params[0].split("=")[1];
    this.type = params[1].split("=")[1];

    this.getEwmCheckInfo();
  }

  async getEwmCheckInfo() {

    let res = await this.houseTradeService.getEwmCheckInfo(this.id, this.type);
    if (res && res.code == 200) {
      this.data = res.msg;
    }
  }


}
