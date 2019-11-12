import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'auditWorkFlow'
})
export class AuditWorkFlowPipe implements PipeTransform {

  transform(value: any): any {
    let result: string = '';

    switch (value) {
      case 0:
        result = '未提交';
        break;
      case 1:
        result = '待受理';
        break;
      case 2:
        result = '待初审';
        break;
      case 3:
        result = '待核定';
        break;
      case 4:
        result = '待登簿';
        break;
      case 5:
        result = '已备案';
        break;

      default:
        break;
    }

    return result;
  }

}
