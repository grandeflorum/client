import { Component, OnInit ,Input} from '@angular/core';

@Component({
  selector: 'app-contract-content',
  templateUrl: './contract-content.component.html',
  styleUrls: ['./contract-content.component.scss']
})
export class ContractContentComponent implements OnInit {

  @Input() content: any;
  constructor() { }

  ngOnInit() {
  }

  config = {
    readonly: true,
    toolbars: [],
    wordCount: false,
    elementPathEnabled: false,
    enableAutoSave: false,
    autoHeightEnabled: false,
    initialFrameWidth: 800,
    initialFrameHeight: 450,
  };

}
