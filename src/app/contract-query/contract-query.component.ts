import { Component, OnInit } from '@angular/core';
import { HttpHeaders, HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-contract-query',
  templateUrl: './contract-query.component.html',
  styleUrls: ['./contract-query.component.scss']
})
export class ContractQueryComponent implements OnInit {

  type: any = "";
  data:any = {};
  id = "";

  constructor(
    private http:HttpClient
  ) { }

  ngOnInit() {
    setTimeout(() => {
      $('html').css({'min-width':'unset','min-height':'unset'});
      $('body').css({'min-width':'unset','min-height':'unset'});
    }, 500);
    
  }

  typeChange(type){
    this.type = type;
    this.data = {};
  }

  async QueryHouseTradeByCode() {
    
    var option = {
      Token: 'GanHuTongCrinum',
        IdentityCode: this.id
    }
    if(this.type == '1'){//商品房
      this.http.post('http://182.85.83.7:8011/DataExchange/QueryNewHouseTradeByCode',option).subscribe((data:any)=>{
        if(data&&data.Data&&data.Data.length>0){
          this.data = data.Data[0]
        }else{
          this.data = {}
        }
      })

    }else if(this.type == '2'){//存量房
      this.http.post('http://182.85.83.7:8011/DataExchange/QueryStockHouseTradeByCode',option).subscribe((data:any)=>{
       if(data&&data.Data.length>0){
         this.data = data.Data[0]
       }else{
        this.data = {}
      }
      })
    }

    
  }

  back(){
    this.type ='';
    this.id= '';
    this.data = {};
  }


}
