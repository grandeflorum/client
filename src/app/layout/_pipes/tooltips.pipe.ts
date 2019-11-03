import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'tooltips'
})
export class TooltipsPipe implements PipeTransform {

    transform(strName: any, len: number): any {
        let result: any;
        if (strName != null) {
            if (strName.length > len) {
                result = strName.substring(0, len) + '...';
            }
            else {
                result = strName;
            }
        }
        else {
            result = strName;
        }
        return result;
    }

}
