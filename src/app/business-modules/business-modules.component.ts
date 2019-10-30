import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
    templateUrl: './business-modules.component.html',
    styleUrls: ['./business-modules.component.scss']
})
export class BusinessModulesComponent implements OnInit {
    isCollapsed = false;

    menuList = [
        { name: '首页', id: 'sy', route: '/home' , icon:'dashboard' , children:[]},
        { name: '从业主体管理', id: 'cyztgl', route: '/cyztgl' , icon:'dashboard'  ,children:[
            {name: '开发企业管理', id: 'kfqygl', route: '/cyztgl/kfqygl' , icon:'dashboard' },
            {name: '经纪企业管理', id: 'jjqygl', route: '/cyztgl/jjqygl' , icon:'dashboard' },
            {name: '从业人员管理', id: 'cyrygl', route: '/cyztgl/cyrygl' , icon:'dashboard' },
        ]},
        { name: '项目管理', id: 'xmgl', route: '/xmgl' , icon:'dashboard'  ,children:[]},
        { name: '楼盘表管理', id: 'lpbgl', route: '/lpbgl' , icon:'dashboard'  ,children:[]},
        { name: '存量房管理', id: 'clfgl', route: '/clfgl' , icon:'dashboard'  ,children:[]},
        { name: '合同备案管理', id: 'htbagl', route: '/htbagl' , icon:'dashboard'  ,children:[]},
        { name: '在建工程抵押管理', id: 'zjgcdygl', route: '/zjgcdygl' , icon:'dashboard'  ,children:[]},
        { name: '预查封管理', id: 'ycfgl', route: '/ycfgl' , icon:'dashboard'  ,children:[]},
        { name: '宗地抵押管理', id: 'zddygl', route: '/zddygl' , icon:'dashboard'  ,children:[]},
        { name: '统计分析', id: 'statistics', route: '/statistics' , icon:'dashboard'  ,children:[]},
        { name: '系统管理', id: 'system', route: '/system' , icon:'dashboard' ,children:[]},
    ]

    ngOnInit() {
        
    }

}
