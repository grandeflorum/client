import { Component, OnInit, ViewChildren, QueryList } from '@angular/core';
import { NzTreeNodeOptions, NzMessageService } from 'ng-zorro-antd';
import { Router } from '@angular/router';
import { TreeNodeInterface } from 'src/app/utilities/entities/entities';
import { OrganizationService } from '../../service/system/organization.service';
import { ValidationDirective } from 'src/app/layout/_directives/validation.directive';

@Component({
  selector: 'app-organization',
  templateUrl: './organization.component.html',
  styleUrls: ['./organization.component.scss']
})
export class OrganizationComponent implements OnInit {

  @ViewChildren(ValidationDirective) directives: QueryList<ValidationDirective>;
  dictionary: any = {};
  staffObj: any = {};
  data: any = {};
  dataSet: any = [];
  menuTreeNodes: any = [];
  currentOrg: any = {};
  name: any = '';

  title: any = '';
  isVisible = false;
  isOkLoading = false;
  isAddNew: boolean;

  constructor(
    private router: Router,
    private msg: NzMessageService,
    private orgService: OrganizationService,
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
          level: 0,
          menuLevel: 0,
          menuOrder: 0,
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

    if (this.name) {
      option.conditions.push({ key: 'name', value: this.name });
    }

    let data = await this.orgService.getAllOrganization();

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
    this.title = '添加机构';
    this.currentOrg = {};
  }

  modify(item) {
    this.isVisible = true;
    this.isAddNew = false;
    this.title = '编辑机构信息';
    this.currentOrg = item;
  }

  async delete(item) {
    let res = await this.orgService.deleteOrganizationByIds([item.id]);
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
    if (this.isAddNew && this.currentOrg.parentId == null) {
      this.currentOrg.parentId = '0';
    }

    this.currentOrg.orgLever = this.currentOrg.orgLever ? this.currentOrg.orgLever : 0;
    this.currentOrg.orgLeverOrder = this.currentOrg.orgLeverOrder ? this.currentOrg.orgLeverOrder : 0;

    let res = await this.orgService
      .saveOrUpdateOrganization(this.currentOrg);

    if (res) {
      this.isVisible = false;
      this.isOkLoading = false;
      this.currentOrg = {};
      if (res.code === 200) {
        this.msg.create('success', '保存成功');
        this.search();
      } else {
        this.msg.create('error', '保存失败');
      }
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
