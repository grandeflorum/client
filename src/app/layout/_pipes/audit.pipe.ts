import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'audit'
})
export class AuditPipe implements PipeTransform {

    transform(value: any): any {
        let result: string = '';

        switch (value) {
            case 0:
                result = '未提交';
                break;
            case 1:
                result = '待审核';
                break;
            case 2:
                result = '一次审核';
                break;
            case 3:
                result = '待修改';
                break;
            case 4:
                result = '二次审核';
                break;
            default:
                break;
        }

        return result;
    }

}
