import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { SystemDictionaryService } from './service/system/system-dictionary.service';
import { Localstorage } from './service/localstorage';
import { NzMessageService } from 'ng-zorro-antd';

@Component({
    templateUrl: './business-modules.component.html',
    styleUrls: ['./business-modules.component.scss']
})
export class BusinessModulesComponent implements OnInit {
    isCollapsed = false;

    constructor(
        private systemDictionaryService: SystemDictionaryService,
        private msg: NzMessageService,
        private localstorage: Localstorage
    ) {

    }

    menuList = [
        { name: '首页', id: 'sy', route: '/home', icon: 'dashboard', children: [] },
        {
            name: '从业主体管理', id: 'practitioner', route: '/practitioner', icon: 'dashboard', children: [
                { name: '开发企业管理', id: 'company', route: '/practitioner/company', icon: 'dashboard' },
                { name: '经纪企业管理', id: 'jjqygl', route: '/cyztgl/jjqygl', icon: 'dashboard' },
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
        { name: '存量房管理', id: 'clfgl', route: '/clfgl', icon: 'dashboard', children: [] },
        {
            name: '合同备案管理', id: 'htbagl', route: '/htbagl', icon: 'dashboard', children: [
                { name: '商品房合同备案', id: 'spfhtba', route: '/htbagl/spfhtba', icon: 'dashboard' },
                { name: '存量房合同备案', id: 'clfhtba', route: '/htbagl/clfhtba', icon: 'dashboard' },
                { name: '合同模板管理', id: 'htmbgl', route: '/htbagl/htmbgl', icon: 'dashboard' }
            ]
        },
        { name: '在建工程抵押管理', id: 'zjgcdygl', route: '/zjgcdygl', icon: 'dashboard', children: [] },
        { name: '预查封管理', id: 'ycfgl', route: '/ycfgl', icon: 'dashboard', children: [] },
        { name: '宗地抵押管理', id: 'zddygl', route: '/zddygl', icon: 'dashboard', children: [] },
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
        this.getAllDictionary();
    }


    async getAllDictionary() {
        let res = await this.systemDictionaryService.getAllDictionary();

        if (res && res.code == 200) {
            this.localstorage.setObject('dictionary', res.msg);
        } else {
            this.msg.create('error', '查询字典表失败');
        }
    }

}
