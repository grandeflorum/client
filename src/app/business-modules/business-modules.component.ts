import { Component, OnInit, ViewChildren, QueryList } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { SystemDictionaryService } from './service/system/system-dictionary.service';
import { Localstorage } from './service/localstorage';
import { NzMessageService, NzModalService } from 'ng-zorro-antd';
import { StaffSercice } from './service/common/staff-service';
import { UserService } from './service/system/user.service';
import { ValidationDirective } from '../layout/_directives/validation.directive';
import { RegionService } from './service/system/region.service';

@Component({
    templateUrl: './business-modules.component.html',
    styleUrls: ['./business-modules.component.scss']
})
export class BusinessModulesComponent implements OnInit {

    @ViewChildren(ValidationDirective) directives: QueryList<ValidationDirective>;

    isCollapsed = false;
    breadcrumbList = [];
    currentUrl = "";

    name: any = "";

    isVisiblePwd: any = false;
    changeUser: any = {};
    logUser: any = {};

    constructor(
        private systemDictionaryService: SystemDictionaryService,
        private msg: NzMessageService,
        private localstorage: Localstorage,
        private router: Router,
        private staffSercice: StaffSercice,
        private modal: NzModalService,
        private userService: UserService,
        private regionService: RegionService
    ) {

    }

    menuList = [
        // { name: '首页', id: 'sy', route: '/home', icon: 'dashboard', children: [] },
        {
            name: '从业主体管理', id: 'practitioner', route: '/practitioner', icon: 'dashboard', children: [
                { name: '开发企业管理', id: 'company', route: '/practitioner/company', icon: 'dashboard' },
                { name: '经纪企业管理', id: 'economic', route: '/practitioner/economic', icon: 'dashboard' },
                { name: '从业人员管理', id: 'employee', route: '/practitioner/employee', icon: 'dashboard' },
            ]
        },
        {
            name: '项目管理', id: 'xmgl', route: '/xmgl', icon: 'dashboard', children: [
                { name: '开发项目管理', id: 'kfxmgl', route: '/xmgl/kfxmgl', icon: 'dashboard' },
                { name: '项目手册管理', id: 'xmscgl', route: '/xmgl/xmscgl', icon: 'dashboard' },
            ]
        },
        { name: '楼盘表管理', id: 'lpbgl', route: '/lpbgl', icon: 'dashboard', children: [] },
        { name: '存量房管理', id: 'stockHouse', route: '/stockHouse', icon: 'dashboard', children: [] },
        {
            name: '合同备案管理', id: 'contract', route: '/contract', icon: 'dashboard', children: [
                { name: '商品房合同备案', id: 'houseTrade', route: '/contract/houseTrade', icon: 'dashboard' },
                { name: '存量房合同备案', id: 'stockTrade', route: '/contract/stockTrade', icon: 'dashboard' },
                { name: '合同模板管理', id: 'contractTemplate', route: '/contract/contractTemplate', icon: 'dashboard' }
            ]
        },
        { name: '在建工程抵押管理', id: 'zjgcdygl', route: '/zjgcdygl', icon: 'dashboard', children: [] },
        { name: '预查封管理', id: 'ycfgl', route: '/ycfgl', icon: 'dashboard', children: [] },
        { name: '宗地抵押管理', id: 'zddygl', route: '/zddygl', icon: 'dashboard', children: [] },
        { name: '房屋租赁管理', id: 'houserental', route: '/houserental', icon: 'dashboard', children: [] },
        {
            name: '统计分析', id: 'statistics', route: '/statistics', icon: 'dashboard', children: [
                { name: '销售排行榜分析', id: 'xsphbfx', route: '/statistics/xsphbfx', icon: 'dashboard' },
                { name: '时间查询统计分析', id: 'sjcxtjfx', route: '/statistics/sjcxtjfx', icon: 'dashboard' },
                { name: '交易汇总信息分析', id: 'jyhzxxfx', route: '/statistics/jyhzxxfx', icon: 'dashboard' }
            ]
        },
        {
            name: '系统管理', id: 'system', route: '/system', icon: 'dashboard', children: [
                { name: '组织机构', id: 'organization', route: '/system/organization', icon: 'dashboard' },
                { name: '用户管理', id: 'user', route: '/system/user', icon: 'dashboard' },
                { name: '岗位管理', id: 'role', route: '/system/role', icon: 'dashboard' },
                { name: '权限管理', id: 'menu', route: '/system/menu', icon: 'dashboard' },
            ]
        },
    ]

    ngOnInit() {

        this.logUser = this.staffSercice.getStaffObj();
        if (!this.logUser.id && this.router.url != '/login') {
            this.router.navigate(['/login']);
        } else {
            this.name = this.logUser.realname;
        }

        this.getAllDictionary();
        this.getAllRegion();
        this.currentUrl = this.router.url;

        this.urlChange();


    }

    menuItemClick(item) {
        if (item.children && item.children.length > 0) {
            //this.router.navigate([item.children[0].route]);
        } else {
            this.router.navigate([item.route]);
        }

    }


    urlChange() {
        const url = this.router.url;

        this.menuList.forEach((v, k) => {
            if (url.indexOf(v.route) > -1) {
                this.breadcrumbList.push(v);

                if (v.children.length > 0) {
                    v.children.forEach((vv, kk) => {
                        if (url.indexOf(vv.route) > -1) {
                            this.breadcrumbList.push(vv);
                        }
                    })
                }
            }
        })

        console.log(this.breadcrumbList)

    }


    async getAllDictionary() {
        let res = await this.systemDictionaryService.getAllDictionary();

        if (res && res.code == 200) {
            this.localstorage.setObject('dictionary', res.msg);
        } else {
            this.msg.create('error', '查询字典表失败');
        }
    }

    async getAllRegion() {
        let res = await this.regionService.getAllRegion();
        if (res && res.code == 200) {
            this.localstorage.setObject('region', res.msg);
        } else {
            this.msg.create('error', '查询行政区划失败');
        }
    }

    exitSystem() {
        this.modal.confirm({
            nzTitle: '<i>提示</i>',
            nzContent: '<b>确定退出系统？</b>',
            nzOnOk: () => this.loginOut()
        });
    }

    async loginOut() {
        let res = await this.userService.loginout();

        if (res && res.code == 200) {
            sessionStorage.removeItem('staffObj');
            sessionStorage.removeItem('permission');

            this.router.navigate(['/login']);
        }


    }

    changePassword() {

        this.isVisiblePwd = true;
        this.changeUser = {};
    }

    async handleOk() {

        if (!this.FormValidation()) {
            return;
        }

        if (this.changeUser.password != this.logUser.password) {
            this.msg.create("warning", "原密码输入有误");
            return;
        }

        if (this.changeUser.passwordNew != this.changeUser.passwordCofirm) {
            this.msg.create("warning", "两次输入密码不一致");
            return;
        }

        if (this.changeUser.passwordNew != this.logUser.password) {
            this.msg.create("warning", "新密码不能与原始密码相同");
            return;
        }


        let data = { id: this.logUser.id, password: this.changeUser.passwordNew };
        let res = await this.userService.changePassword(data);

        if (res && res.code == 200) {
            this.isVisiblePwd = false;
            this.logUser.password = this.changeUser.passwordNew;
            this.msg.create("success", "修改成功");
        } else {
            this.msg.create("erroe", "修改失败");
        }

    }

    FormValidation() {
        let isValid = true;
        this.directives.forEach(d => {
            if (!d.validationValue()) {
                isValid = false;
            }
        });
        return isValid;
    }

}
