import { Component, OnInit, ViewChildren, QueryList } from '@angular/core';
import { NzTreeNodeOptions, NzMessageService } from 'ng-zorro-antd';
import { TreeNodeInterface } from 'src/app/utilities/entities/entities';
import { ValidationDirective } from 'src/app/layout/_directives/validation.directive';
import { Router } from '@angular/router';
import { MenuService } from '../../service/system/menu.service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrls: ['./menu.component.scss']
})
export class MenuComponent implements OnInit {

  @ViewChildren(ValidationDirective) directives: QueryList<ValidationDirective>;

  data: any = {};
  dataSet: any = [];
  menuTreeNodes: any = [];
  currentMenu: any = {};
  name: any = '';

  title: any = '';
  isVisible = false;
  isOkLoading = false;
  isAddNew: boolean;

  constructor(
    private router: Router,
    private msg: NzMessageService,
    private menuService: MenuService,
  ) { }
  mapOfExpandedData: { [id: string]: TreeNodeInterface[] } = {};

  collapse(
    array: TreeNodeInterface[],
    data: TreeNodeInterface,
    $event: boolean
  ): void {
    if ($event === false) {
      if (data.children) {
        data.children.forEach(d => {
          const target = array.find(a => a.id === d.id);
          target.expand = false;
          this.collapse(array, target, false);
        });
      } else {
        return;
      }
    }
  }

  convertTreeToList(root: object): TreeNodeInterface[] {
    const stack: any[] = [];
    const array: any[] = [];
    const hashMap = {};
    stack.push({ ...root, level: 0, expand: false });

    while (stack.length !== 0) {
      const node = stack.pop();
      this.visitNode(node, hashMap, array);
      if (node.children) {
        for (let i = node.children.length - 1; i >= 0; i--) {
          stack.push({
            ...node.children[i],
            level: node.level + 1,
            expand: false,
            parent: node
          });
        }
      }
    }

    return array;
  }

  visitNode(
    node: TreeNodeInterface,
    hashMap: { [key: string]: any },
    array: TreeNodeInterface[]
  ): void {
    if (!hashMap[node.id]) {
      hashMap[node.id] = true;
      array.push(node);
    }
  }

  generateTree(data, parentId) {
    const itemArr: any[] = [];
    for (var i = 0; i < data.length; i++) {
      var node = data[i];
      if (node.parentId == parentId) {
        let newNode: TreeNodeInterface;
        newNode = {
          id: node.id,
          name: node.name,
          parentId: parentId,
          code: node.code,
          menuLevel: node.menuLevel,
          menuOrder: node.menuOrder,
          level: 0,
          expand: false,
          children: this.generateTree(data, node.id)
        };
        itemArr.push(newNode);
      }
    }
    return itemArr;
  }

  generateTree2(data, parentId) {
    const itemArr: any[] = [];
    for (var i = 0; i < data.length; i++) {
      var node = data[i];
      if (node.parentId == parentId) {
        let newNode: NzTreeNodeOptions;
        newNode = {
          key: node.id,
          title: node.name
        };
        let children = this.generateTree2(data, node.id);
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
  ngOnInit() {
    this.search();
  }

  async search() {

    let option = {
      conditions: []
    };

    let data = await this.menuService.getAllMenu();

    if (data) {
      this.dataSet = this.generateTree(data.msg, '0');
      this.menuTreeNodes = this.generateTree2(data.msg, '0');
      this.dataSet.forEach(item => {
        this.mapOfExpandedData[item.id] = this.convertTreeToList(item);
      });
    }

  }

  add() {
    this.isVisible = true;
    this.isAddNew = true;
    this.title = '添加菜单';
    this.currentMenu = {};
  }

  modify(item) {
    this.isVisible = true;
    this.isAddNew = false;
    this.title = '编辑菜单信息';
    this.currentMenu = item;
  }

  async delete(item) {
    let res = await this.menuService.deleteMenuByIds([item.id]);
    if (res.code === 200) {
      this.msg.create('success', '删除成功');
      this.search();
    } else {
      this.msg.create('error', '删除失败');
    }

  }

  async handleOk() {
    if (!this.FormValidation()) {
      return;
    }
    this.isOkLoading = true;
    if (this.isAddNew && this.currentMenu.parentId == null) {
      this.currentMenu.parentId = '0';
    }

    this.currentMenu.menuLevel = this.currentMenu.menuLevel ? this.currentMenu.menuLevel : 0;
    this.currentMenu.menuOrder = this.currentMenu.menuOrder ? this.currentMenu.menuOrder : 0;
    let res = await this.menuService.saveOrUpdateMenu(this.currentMenu);

    this.isVisible = false;
    this.isOkLoading = false;
    this.currentMenu = {};
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

}
