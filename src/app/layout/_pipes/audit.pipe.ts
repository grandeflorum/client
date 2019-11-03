import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'audit'
})
export class AuditPipe implements PipeTransform {

    transform(value: any): any {
        let result: string = '';
        if (value == 0) {
            result = '未提交';
        } else if (value == 1) {
            result = '待审核';
        } else {
            result = '已审核';
        }
        return result;
    }

}
