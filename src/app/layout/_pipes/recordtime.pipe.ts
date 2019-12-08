import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'recordtime'
})
export class RecordtimePipe implements PipeTransform {

    transform(value: any, type?: any): any {

        var dateee = new Date(value).toJSON();
        var date = new Date(+new Date(dateee) + 8 * 3600 * 1000).toISOString().replace(/T/g, ' ').replace(/\.[\d]{3}Z/, '');

        var result = date.split(" ")[0];

        if (result == "1970-01-01") {
            return "";
        }

        if (type == "year") {
            result = result.split("-")[0];
        }

        if (type == "month") {
            result = result.split("-")[0]+"/"+result.split("-")[1];
        }

        if (type == "time") {
            result = date;
        }

        return result;
    }

}
