import { Component, OnInit, ViewChildren, QueryList } from '@angular/core';
import { NzMessageService } from 'ng-zorro-antd';
import { RoleService } from '../../service/system/role.service';
import { OrganizationService } from '../../service/system/organization.service';
import { UserService } from '../../service/system/user.service';
import { ValidationDirective } from 'src/app/layout/_directives/validation.directive';

@Component({
  selector: 'app-user',
  templateUrl: './user.component.html',
  styleUrls: ['./user.component.scss']
})
export class UserComponent implements OnInit {

  @ViewChildren(ValidationDirective) directives: QueryList<ValidationDirective>;
  dictionary: any = {};
  staffObj: any = {};

  pageIndex: any = 1;
  totalCount: any;
  pageSize: any = 10;

  dataSet: any = [];
  allRoles: any = [];
  currentUser: any = {};
  allOrgList: any = [];
  orgTreeNodes: any = [];

  isVisible = false;
  isOkLoading = false;
  title: string;
  isDisable: boolean;
  username: string;
  realname: string;
  mobile: string;
  selectId: any = '';
  isView = false; //查看操作标志
  canManage: any = false;

  constructor(
    private msg: NzMessageService,
    private roleService: RoleService,
    private orgService: OrganizationService,
    private userService: UserService
  ) { }

  ngOnInit() {

    this.search();
  }

  async search() {
    let option = {
      pageNo: this.pageIndex,
      pageSize: this.pageSize,
      conditions: []
    };

    if (this.username) {
      option.conditions.push({ key: 'username', value: this.username });
    }
    if (this.mobile) {
      option.conditions.push({ key: 'mobile', value: this.mobile });
    }
    if (this.realname) {
      option.conditions.push({ key: 'realname', value: this.realname });
    }

    let data = await this.userService.getUserList(option);
    if (data) {
      this.dataSet = data.msg.currentList;
      this.totalCount = data.msg.recordCount;
    }

    let orgData = await this.orgService.getAllOrganization()
    if (orgData) {
      this.allOrgList = orgData.msg;
      this.orgTreeNodes = this.generateTree2(orgData.msg, '0');
    }

    let roleData = await this.roleService.getAllRoles();
    if (roleData) {
      this.allRoles = roleData.msg;
    }

  }

  generateTree2(data, parentId) {
    const itemArr: any[] = [];
    for (var i = 0; i < data.length; i++) {
      var node = data[i];
      if (node.parentId == parentId) {
        let newNode: any;
        newNode = {
          key: node.id,
          title: node.name
        };
        let children = this.generateTree2(data, node.id);
        if (children.length > 0) {
          newNode.children = children;
        } else {
          newNode.isLeaf = true;
        }
        itemArr.push(newNode);
      }
    }
    return itemArr;
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

  reset() {
    this.username = '';
    this.mobile = '';
    this.realname = '';
  }

  add() {
    this.title = '添加用户';
    this.currentUser = {};
    this.isVisible = true;
    this.isDisable = false;
  }

  async show(item) {
    this.isVisible = true;
    this.isView = true;
    this.title = '查看用户信息';
    this.currentUser = item;
    this.isDisable = true;
    let data = await this.userService.getUserWithRoleByUserId(item.id);
    const roleList: any = [];
    for (let i = 0; i < data.msg.roleList.length; i++) {
      roleList.push(data.msg.roleList[i].id);
    }
    this.currentUser.roleList = roleList;

  }

  async modify() {
    if (this.selectId) {
      this.isDisable = false;
      this.isVisible = true;
      this.title = '编辑用户信息';
      let data = await this.userService.getUserWithRoleByUserId(this.currentUser.id);

      const roleList: any = [];
      for (let i = 0; i < data.msg.roleList.length; i++) {
        roleList.push(data.msg.roleList[i].id);
      }
      this.currentUser.roleList = roleList;

    } else {
      this.msg.create('warning', '请选择修改项');
    }
  }

  async delete() {
    if (this.selectId) {

      let res = await this.userService.deleteUserByIds([this.selectId]);
      if (res.code === 200) {
        this.msg.create('success', '删除成功');
        this.search();
      } else if (res.code === 500) {
        this.msg.create('warning', res.msg);
      } else {
        this.msg.create('error', '删除失败');
      }

    } else {
      this.msg.create('warning', '请选择删除项');
    }
  }

  async handleOk() {
    //查看详情操作直接返回
    if (this.isView) {
      this.isView = false;
      this.isVisible = false;
      return;
    }
    if (!this.FormValidation()) {
      return;
    }
    this.isOkLoading = true;
    for (let i = 0; i < this.currentUser.roleList.length; i++) {
      let id = this.currentUser.roleList[i];
      this.currentUser.roleList[i] = this.allRoles.find(
        myObj => myObj.id === id
      );
    }
    let res = await this.userService.saveOrUpdateUser(this.currentUser);
    this.isOkLoading = false;
    this.isVisible = false;
    this.currentUser = {};
    if (res.code === 200) {
      this.msg.create('success', '保存成功');
      this.search();
    } else {
      this.msg.create('error', res.msg ? res.msg : '保存失败');
    }

  }

  handleCancel(): void {
    this.isVisible = false;
    this.isDisable = false;
    this.isView = false;
  }

  selectItem(data) {
    this.currentUser = data;
    this.selectId = data.id;
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
