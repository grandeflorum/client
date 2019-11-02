import { Component, OnInit, QueryList, ViewChildren } from '@angular/core';
import { ValidationDirective } from 'src/app/layout/_directives/validation.directive';
import { Localstorage } from '../../../service/localstorage';

@Component({
  selector: 'app-employee-detail',
  templateUrl: './employee-detail.component.html',
  styleUrls: ['./employee-detail.component.scss']
})
export class EmployeeDetailComponent implements OnInit {
  @ViewChildren(ValidationDirective) directives: QueryList<ValidationDirective>;

  employee: any = {};

  isDisable: boolean = false;

  constructor(
    private localstorage: Localstorage
  ) { }

  ngOnInit() {
    this.getDictory();
  }


  getDictory() {
    let data = this.localstorage.getObject("dictionary");
  }

}
