import { Injectable } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class StaffSercice {

    constructor() { }


    getStaffObj(): any {

        let staffObj = sessionStorage.getItem("staffObj");

        if (staffObj) {
            return JSON.parse(staffObj).userinfo;
        } else {
            return {};
        }
    }

    setStaffObj(item): any {

        let staffObj = JSON.stringify(item);
        sessionStorage.setItem("staffObj", staffObj);

    }

}
