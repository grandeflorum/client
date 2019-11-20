import { Component, OnInit, ViewChildren, QueryList } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { UserService } from '../business-modules/service/system/user.service';
import { StaffSercice } from '../business-modules/service/common/staff-service';
import { Router } from '@angular/router';
import { Localstorage } from '../business-modules/service/localstorage';
import { ValidationDirective } from '../layout/_directives/validation.directive';
import { NzMessageService } from 'ng-zorro-antd';
import { OrganizationService } from '../business-modules/service/system/organization.service';
import { RoleService } from '../business-modules/service/system/role.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  validateForm: FormGroup;

  @ViewChildren(ValidationDirective) directives: QueryList<ValidationDirective>;
  image: any;
  canvas: any;
  rand: any;

  username: any = "";
  password: any = "";
  code: any = "";

  loginMessage: any = "";
  isLogining: any = false;

  //记住我
  remebermeChecked: any = false;
  isVisible: any = false;

  //步骤条下标
  current = 0;
  registerUser: any = { roleList: [] };
  registerCode: any = "";
  comfirmPassword: any = "";

  allRoles: any = [];
  allOrgList: any = [];
  orgTreeNodes: any = [];

  nums = [
    '1',
    '2',
    '3',
    '4',
    '5',
    '6',
    '7',
    '8',
    '9',
    '0',
    'A',
    'B',
    'C',
    'D',
    'E',
    'F',
    'G',
    'H',
    'I',
    'J',
    'K',
    'L',
    'M',
    'N',
    'O',
    'P',
    'Q',
    'R',
    'S',
    'T',
    'U',
    'V',
    'W',
    'X',
    'Y',
    'Z',
    'a',
    'b',
    'c',
    'd',
    'e',
    'f',
    'g',
    'h',
    'i',
    'j',
    'k',
    'l',
    'm',
    'n',
    'o',
    'p',
    'q',
    'r',
    's',
    't',
    'u',
    'v',
    'w',
    'x',
    'y',
    'z'
  ];

  constructor(private userService: UserService, private staffSercice: StaffSercice
    , private router: Router, private localstorage: Localstorage,
    private msg: NzMessageService, private roleService: RoleService,
    private orgService: OrganizationService) { }

  ngOnInit(): void {

    let that = this;
    let remeberData = that.localstorage.getObject("remeber");

    //记住密码赋值
    if (remeberData) {
      that.remebermeChecked = remeberData.remebermeChecked;
      that.username = remeberData.username;
      that.password = remeberData.password;
    }

    setTimeout(() => {
      that.drawCode('verifyCanvas', 'code_img');

      document.getElementById('code_img').onclick = function () {
        $('#verifyCanvas').remove();
        $('#verify').after(
          '<canvas width="100" height="40" id="verifyCanvas"></canvas>'
        );
        that.drawCode('verifyCanvas', 'code_img');
      };
    }, 100);
  }


  drawCode(id, imgid) {
    this.canvas = document.getElementById(id); //获取HTML端画布
    var context = this.canvas.getContext('2d'); //获取画布2D上下文
    context.fillStyle = 'cornflowerblue'; //画布填充色
    context.fillRect(0, 0, this.canvas.width, this.canvas.height);
    // 创建渐变
    var gradient = context.createLinearGradient(0, 0, this.canvas.width, 0);
    gradient.addColorStop('0', 'magenta');
    gradient.addColorStop('0.5', 'blue');
    gradient.addColorStop('1.0', 'red');
    //清空画布
    context.fillStyle = gradient; //设置字体颜色
    context.font = '25px Arial'; //设置字体
    this.rand = new Array();
    var x = new Array();
    var y = new Array();
    for (var i = 0; i < 4; i++) {
      this.rand[i] = this.nums[Math.floor(Math.random() * this.nums.length)];
      x[i] = i * 16 + 10;
      y[i] = Math.random() * 20 + 20;
      context.fillText(this.rand[i], x[i], y[i]);
    }

    //画3条随机线
    for (var i = 0; i < 3; i++) {
      this.drawline(this.canvas, context);
    }

    // 画30个随机点
    for (var i = 0; i < 30; i++) {
      this.drawDot(this.canvas, context);
    }
    this.convertCanvasToImage(this.canvas, id, imgid);
  }

  // 随机线
  drawline(canvas, context) {
    context.moveTo(
      Math.floor(Math.random() * canvas.width),
      Math.floor(Math.random() * canvas.height)
    ); //随机线的起点x坐标是画布x坐标0位置，y坐标是画布高度的随机数
    context.lineTo(
      Math.floor(Math.random() * canvas.width),
      Math.floor(Math.random() * canvas.height)
    ); //随机线的终点x坐标是画布宽度，y坐标是画布高度的随机数
    context.lineWidth = 0.5; //随机线宽
    context.strokeStyle = 'rgba(50,50,50,0.3)'; //随机线描边属性
    context.stroke(); //描边，即起点描到终点
  }
  // 随机点(所谓画点其实就是画1px像素的线，方法不再赘述)
  drawDot(canvas, context) {
    var px = Math.floor(Math.random() * canvas.width);
    var py = Math.floor(Math.random() * canvas.height);
    context.moveTo(px, py);
    context.lineTo(px + 1, py + 1);
    context.lineWidth = 0.2;
    context.stroke();
  }
  // 绘制图片
  convertCanvasToImage(canvas, id, imgid) {
    document.getElementById(id).style.display = 'none';
    this.image = document.getElementById(imgid);
    this.image.src = canvas.toDataURL('image/png');
    return this.image;
  }

  async login() {
    this.loginMessage = '';

    if (!this.username) {
      this.loginMessage = '用户名不能为空';
      return;
    }

    if (!this.password) {
      this.loginMessage = '密码不能为空';
      return;
    }

    if (!this.code) {
      this.loginMessage = '验证码不能为空';
      return;
    }

    var newRand = this.rand.join('');
    if (newRand.toLocaleLowerCase() != this.code.toLocaleLowerCase()) {
      this.loginMessage = '验证码不正确';
      return;
    }

    this.isLogining = true;
    // 接口调用示例
    let data = await this.userService
      .login({
        username: this.username,
        password: this.password,
        code: this.code
      })

    this.isLogining = false;

    if (data && data.code == 200) {

      //记住我
      if (this.remebermeChecked) {
        this.localstorage.setObject("remeber", {
          remebermeChecked: this.remebermeChecked,
          username: this.username,
          password: this.password
        });
      }

      this.staffSercice.setStaffObj(data.msg);
      sessionStorage.setItem(
        'permission',
        JSON.stringify(data.msg.permission)
      );
      sessionStorage.setItem('AUTH_ID', data.msg.ticket);
      sessionStorage.setItem('userinfo', JSON.stringify(data.msg.userinfo));
      this.router.navigate(['/practitioner/company']);
    } else {
      this.loginMessage = '用户名密码错误';
    }


  }

  //注册
  async register() {
    this.isVisible = true;

    this.current = 0;
    this.registerUser = { roleList: [] };
    this.registerCode = "";
    this.comfirmPassword = "";

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

  pre(): void {
    this.current -= 1;
  }

  async next() {

    if (!this.FormValidation()) {
      return;
    }

    if (this.comfirmPassword != this.registerUser.password) {
      this.msg.create("warning", "2次输入密码不一致");
      return;
    }

    if (!this.registerUser.orgId && this.current == 1) {
      this.msg.create("warning", "请选择组织机构");
      return;
    }

    let res = await this.userService.findUserByUsername(this.registerUser.username);

    if (res && res.code == 200) {

      if (res.msg) {
        this.msg.create("warning", "账号已存在");
      } else {
        this.current += 1;
        let that = this;
        if (this.current == 2) {
          setTimeout(() => {
            that.drawCode('verifyCanvas1', 'code_img1');

            document.getElementById('code_img1').onclick = function () {
              $('#verifyCanvas1').remove();
              $('#verify1').after(
                '<canvas width="100" height="40" id="verifyCanvas1"></canvas>'
              );
              that.drawCode('verifyCanvas1', 'code_img1');
            };
          }, 100);
        }
      }
    }


  }

  async done() {
    if (!this.FormValidation()) {
      return;
    }

    var newRand = this.rand.join('');
    if (newRand.toLocaleLowerCase() != this.registerCode.toLocaleLowerCase()) {
      this.msg.create("warning", "验证码不正确");
      return;
    }

    for (let i = 0; i < this.registerUser.roleList.length; i++) {
      let id = this.registerUser.roleList[i];
      this.registerUser.roleList[i] = this.allRoles.find(
        myObj => myObj.id === id
      );
    }
    let res = await this.userService.saveOrUpdateUser(this.registerUser);

    this.isVisible = false;
    if (res.code == 200) {
      this.msg.create('success', '注册成功');
    } else {
      this.msg.create('error', '注册失败');
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
