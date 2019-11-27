import { Component, OnInit, ViewChildren, QueryList } from '@angular/core';
import { NzTreeNodeOptions, NzMessageService } from 'ng-zorro-antd';
import { ValidationDirective } from 'src/app/layout/_directives/validation.directive';
import { MenuService } from '../../service/system/menu.service';
import { RoleService } from '../../service/system/role.service';

@Component({
  selector: 'app-role',
  templateUrl: './role.component.html',
  styleUrls: ['./role.component.scss']
})
export class RoleComponent implements OnInit {

  @ViewChildren(ValidationDirective) directives: QueryList<ValidationDirective>;

  pageIndex: any = 1;
  totalCount: any;
  pageSize: any = 10;

  dataSet: any = [];
  currentRole: any = {};
  allMenuList: any = [];
  menuTreeNodes: any = [];

  isVisible = false;
  isOkLoading = false;
  title: string;
  isDisable: boolean;
  ckeckedRoleMenuList: any = [];
  roleMenuList1: any = [];

  constructor(
    private msg: NzMessageService,
    private roleService: RoleService,
    private menuService: MenuService,
  ) { }

  ngOnInit() {
    this.search();
  }

  async search() {
    var option = {
      pageNo: this.pageIndex,
      pageSize: this.pageSize,
      conditions: []
    };


    let data = await this.roleService.getRoleList(option);
    if (data) {
      this.dataSet = data.msg.currentList;
      this.totalCount = data.msg.recordCount;
    }



    let menudata = await this.menuService.getAllMenu();
    this.allMenuList = menudata.msg;

  }

  generateTree2(data, parentId, canCheck) {
    const itemArr: any[] = [];
    for (let i = 0; i < data.length; i++) {
      let node = data[i];
      if (node.parentId === parentId) {
        let newNode: NzTreeNodeOptions;
        newNode = {
          key: node.id,
          title: node.name,
          disabled: canCheck
        };
        let children = this.generateTree2(data, node.id, canCheck);
        if (children != null) {
          newNode.children = children;
        } else {
          newNode.isLeaf = true;
        }
        itemArr.push(newNode);
      }
    }
    return itemArr.length > 0 ? itemArr : null;
  }

  pageIndexChange(num) {
    this.pageIndex = num;
    this.search();
  }

  pageSizeChange(num) {
    this.pageSize = num;
    this.pageIndex = 1;
    this.search();
  }


  async show(item, flag) {
    this.isVisible = true;
    if (flag) {
      this.title = '编辑角色信息';
      this.isDisable = false;
      this.menuTreeNodes = this.generateTree2(this.allMenuList, '0', false);
    } else {
      this.isDisable = true;
      this.title = '查看角色信息';
      this.menuTreeNodes = this.generateTree2(this.allMenuList, '0', true);
    }
    this.currentRole = item;
    let data = await this.roleService.getRoleById(item.id);

    this.ckeckedRoleMenuList = [];
    const meluList: any = [];
    for (let i = 0; i < data.msg.roleMenuList.length; i++) {
      meluList.push(data.msg.roleMenuList[i].id);
    }
    this.ckeckedRoleMenuList = meluList;

  }

  add() {
    this.isVisible = true;
    this.isDisable = false;
    this.title = '添加角色';
    this.currentRole = {};
    this.menuTreeNodes = this.generateTree2(this.allMenuList, '0', false);
  }

  async delete(item) {
    let res = await this.roleService.deleteRoleByIds([item.id]);
    if (res.code === 200) {
      this.msg.create('success', '删除成功');
      this.search();
    } else if (res.code === 500) {
      this.msg.create('warning', res.msg);
    } else {
      this.msg.create('error', '删除失败');
    }

  }

  async handleOk() {
    if (this.isDisable) {
      this.isVisible = false;
      return;
    }
    if (!this.FormValidation()) {
      return;
    }

    this.isOkLoading = true;
    let list = [];
    if(this.roleMenuList1.length>0){
      for (let i = 0; i < this.roleMenuList1.length; i++) {
        let id = this.roleMenuList1[i].key;
        list.push(this.allMenuList.find(myObj => myObj.id === id));
      }
    }else{
      for (let i = 0; i < this.ckeckedRoleMenuList.length; i++) {
        let id = this.ckeckedRoleMenuList[i];
        list.push(this.allMenuList.find(myObj => myObj.id === id));
      }
    }
    
    this.currentRole.roleMenuList = list;
    let res = await this.roleService.saveOrUpdateRole(this.currentRole);
    this.isOkLoading = false;
    this.isVisible = false;
    this.currentRole = {};
    if (res.code === 200) {
      this.msg.create('success', '保存成功');
      this.search();
    } else {
      this.msg.create('error', '保存失败');
    }

  }

  handleCancel(): void {
    this.isVisible = false;
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

  updateRoleMenuList($event) {
    this.roleMenuList1 = [];
    $event.checkedKeys.forEach(element => {
      let list = this.convertTreeToList(element);
      this.roleMenuList1 = this.roleMenuList1.concat(list);
    });
  }

  convertTreeToList(root) {
    var stack = [],
      array = [],
      hashMap = {};
    stack.push(root);

    while (stack.length !== 0) {
      var node = stack.pop();
      this.visitNode(node, hashMap, array);
      if (node.children) {
        for (var i = node.children.length - 1; i >= 0; i--) {
          stack.push(node.children[i]);
        }
      }
    }

    return array;
  }
  visitNode(node, hashMap, array) {
    if (!hashMap[node.key]) {
      hashMap[node.key] = true;
      array.push(node);
    }
  }

}
