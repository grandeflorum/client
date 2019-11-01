import {
    Directive,
    ElementRef,
    HostListener,
    Input,
    ComponentFactoryResolver,
    ViewContainerRef,
    TemplateRef,
    SimpleChanges,
    Renderer2,
    AfterViewInit,
    AfterContentChecked,
    AfterViewChecked,
    OnInit,
    OnDestroy
} from '@angular/core';
import { NgModel, FormControl } from '@angular/forms';
import { fakeAsync } from '@angular/core/testing';
import { Observable, Subject } from 'rxjs';
import { DecimalPipe } from '@angular/common';

// declare var $: any;  //定义$
import * as $ from 'jquery';

@Directive({
    selector: '[ngModel][validation]',
    exportAs: 'validation'
})
export class ValidationDirective implements AfterViewInit, OnDestroy {
    @Input('validation') validation = true;
    @Input('pattern-error') message;
    @Input('validationType') type: string = '';
    @Input('max-value') maxValue = null;
    @Input('min-value') minValue = null;
    @Input('connect-less') connectLess: any;
    @Input('connect-more') connectMore: any;
    @Input('isBlur') isBulr: any = 0;
    @Input('validationLenth') maxLength = 0;

    //#region  复杂实时比较

    private operators = ['=', '>=', '<=', '>', '<'];

    /**
     * 多个值的比较关系
     */
    @Input('complex-compare') set comparable(v: any) {
        if (v && v instanceof Object) {
            let dest: NgModel = v.dest;
            let operator: string = v.operator;
            let opt: Array<NgModel> = v.opt;

            if (!operator) {
                console.error('complex-compare should appoint operator !');
                return;
            }

            dest.valueChanges.subscribe(e => {
                var result = this.complexCompare(dest, operator, opt);
                this.complexCompareErrorsControl(result, dest, v);
            });

            opt.forEach(m => {
                m.valueChanges.subscribe(e => {
                    let result = this.complexCompare(dest, operator, opt);
                    this.complexCompareErrorsControl(result, m, v);
                });
            });
        } else {
            console.error('complex-compare error binding!');
        }
    }

    private complexCompareErrorsControl(
        result: boolean,
        curNgModel: NgModel,
        combine
    ) {
        if (result) {
            let destControl: FormControl = combine.dest.control;
            destControl.setErrors({ pattern: false }, { emitEvent: true });

            if (combine.dest.custom) {
                combine.dest.custom.errorTip.hide();
                combine.dest.custom.sourceElement.removeClass('ng2-invalid');
            }

            combine.opt.forEach(m => {
                m.control.setErrors({ pattern: false }, { emitEvent: true });
                if (m.custom) {
                    m.custom.errorTip.hide();
                    m.custom.sourceElement.removeClass('ng2-invalid');
                }
            });
        } else {
            curNgModel.control.setErrors({ pattern: true });
        }
    }

    //根据规则比较
    private complexCompare(
        dest: NgModel,
        operator: string,
        opts: Array<NgModel>
    ): boolean {
        var compareResult = true;

        let total = this.transform(dest.value);

        let itemSum = 0;

        opts.forEach(m => {
            itemSum += this.transform(m.value);
        });

        if (operator == '=') {
            if (total != itemSum) {
                compareResult = false;
            }
        } else if (operator == '>=') {
            if (!(total >= itemSum)) {
                compareResult = false;
            }
        } else if (operator == '<=') {
            if (!(total <= itemSum)) {
                compareResult = false;
            }
        }

        return compareResult;
    }

    //数据值 处理
    private transform(v): number {
        var result = 0;
        if (v) {
            if (typeof v == 'string') {
                result = parseFloat(v);
            }
        }
        return result;
    }

    //#endregion

    //#region
    isLoaded = false;
    tips: any;

    subject = new Subject();

    expression = {
        // url: /((([A-Za-z]{3,9}:(?:\/\/)?)(?:[-;:&=\+\$,\w]+@)?[A-Za-z0-9.-]+|(?:www.|[-;:&=\+\$,\w]+@)[A-Za-z0-9.-]+)((?:\/[\+~%\/.\w-_]*)?\??(?:[-\+=&;%@.\w_]*)#?(?:[\w]*))?)/,
        // email: /^([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/,
        //number: /^\d+$/,
        // areaNumber: /^\d+(\.\d{1,2})?$/,
        // wanareaNumber: /^\d+(\.\d{1,6})?$/,
        // telnumber: /^0\d{2,3}-?\d{7,8}$/,
        // floorNum: /^[0-9]+([.][0-9]{1}){0,1}$/,
        // ledgerYear:/^(20[0-9]{2})$/,
        // ledgerMonth:/^(1[0-2]|[1-9])$/,
        // phonenumberReg: /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1}))+\d{8})$/,
        email: function (value) {
            return (
                value != null &&
                /^([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/.test(
                    value
                )
            );
        },
        nullEmail: function (value) {
            return (
                value == null ||
                /^([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/.test(
                    value
                )
            );
        },
        areaNumber: function (value) {
            return value != null && /^\d+(\.\d{1,2})?$/.test(value);
        },
        dylAreaNumber: function (value) {
            //大于零
            return value != null && value > 0 && /^\d+(\.\d{1,2})?$/.test(value);
        },
        zeroAreaNumber: function (value) {
            return value != null && /^\d+(\.\d{1,2})?$/.test(value);
        },
        number: function (value) {
            return /^\d+$/.test(value);
        },
        nullnumber: function (value) {
            return value == null || value == '' || /^\d+$/.test(value);
        },
        nulldate: function (value) {
            return value == null || value == '' || /^\d+$/.test(value);
        },
        phonenumber: function (value) {
            return (
                /^(0\d{2,3}-?)?\d{7,8}$/.test(value) ||
                /^(((13[0-9]{1})|(14[0-9]{1})|(15[0-9]{1})|(17[0-9]{1})|(18[0-9]{1}))+\d{8})$/.test(
                    value
                )
            );
        },
        nullphonenumber: function (value) {
            return (
                value == null ||
                value == '' ||
                (/^(0\d{2,3}-?)?\d{7,8}$/.test(value) ||
                    /^(((13[0-9]{1})|(14[0-9]{1})|(15[0-9]{1})|(17[0-9]{1})|(18[0-9]{1}))+\d{8})$/.test(
                        value
                    ))
            );
        },
        idcard: function (value) {
            // return /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/.test(value);
            return /^[1-9]\d{5}(18|19|20|(3\d))\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/.test(value);
        },
        nullidcard: function (value) {
            return (
                value == null ||
                value == '' ||
                /^[1-9]\d{5}(18|19|20|(3\d))\d{2}((0[1-9])|(1[0-2]))(([0-2][1-9])|10|20|30|31)\d{3}[0-9Xx]$/.test(value)
            );
        },
        // nullAreaNumber: function (value) {
        //     return value == null || value == "" || /^\d+(\.\d{1,2})?$/.test(value);

        // },
        nullFloorNum: function (value) {
            return (
                value == null || value == '' || /^[0-9]+([.][0-9]{1}){0,1}$/.test(value)
            );
        },
        nullAreaNumber: function (value) {
            return (
                value == null || value == '' || /^\d{1,11}(\.\d{0,2})?$/.test(value)
            );
        },
        AreaNumber: function (value) {
            return (
                value != null &&
                value != '' &&
                value != '0' &&
                /^\d{1,11}(\.\d{0,2})?$/.test(value)
            );
        },
        nullMoney: function (value) {
            return (
                value == null || value == '' || /^\d{1,11}(\.\d{0,4})?$/.test(value)
            );
        },
        Characters: function (value) {
            return /^([\u2E80-\u9FFF]){3,}$/.test(value);
        },
        nullCharacters: function (value) {
            return (
                value == null || value == '' || /^([\u2E80-\u9FFF]){3,}$/.test(value)
            );
        },
        SJYTcode: function (value) {
            return value == null || value == '' || /^\d{4}$/.test(value);
        },
        tbbsm: function (value) {
            //更新层图斑标识码，只能输入数字和字母
            return /^[A-Za-z0-9]+$/.test(value);
        },
        tbbh: function (value) {
            return value && value.trim() ? true : false;
        },
        pzwh: function (value) {
            //批准文号的验证规则
            var text = value
                .replace('(', '〔')
                .replace(')', '〕')
                .replace('（', '〔')
                .replace('）', '〕')
                .replace('[', '〔')
                .replace(']', '〕')
                .replace('【', '〔')
                .replace('】', '〕')
                .replace('{', '〔')
                .replace('}', '〕')
                .replace('<', '〔')
                .replace('>', '〕')
                .replace('《', '〔')
                .replace('》', '〕');
            //文号前半段不能输入纯数字
            //如果是纯数字，则让验证不能通过
            if (/^[0-9]+〔20[0-9]{2}〕[0-9]*号$/.test(text)) {
                return /^[a-zA-Z0-9\u4e00-\u9fa5]+(20[0-9]{2})[0-9]*号$/.test(text);
            } else {
                return /^[a-zA-Z0-9\u4e00-\u9fa5]+〔20[0-9]{2}〕[0-9]*号$/.test(text);
            }
        },
        password: function (value) {
            //密码的验证规则
            //必须含数字，字母字符二选一
            return (
                value == null ||
                value == '' ||
                /^(?=.*[a-zA-Z])(?=.*\d)[^]{12,50}$/.test(value)
            );
        }
    };

    exPressionExtend = {
        maxlength: function (value, num) {
            if (!value) {
                return true;
            }
            return value.length <= num
        },
    }
    defaultMsg = {
        required: {
            error: '必填',
            success: "It's Required"
        },
        requiredCommon: {
            error: '必填',
            success: "It's RequiredCommon"
        },
        url: {
            error: '输入必须是Url格式',
            success: "It's Url"
        },
        email: {
            error: '输入必须是Email格式',
            success: "It's Email"
        },
        nullEmail: {
            error: '输入必须是Email格式',
            success: "It's Email"
        },
        number: {
            error: '输入必须是数字',
            success: "It's Number"
        },
        nullnumber: {
            error: '输入必须是数字',
            success: "It's Number"
        },
        areaNumber: {
            error: '输入必须是数字且最多保留两位小数',
            success: "It's areaNumber"
        },
        zeroAreaNumber: {
            error: '输入必须是数字且最多保留两位小数',
            success: "It's areaNumber"
        },
        wanareaNumber: {
            error: '输入必须是数字且最多保留六位小数',
            success: "It's wanareaNumber"
        },
        floorNum: {
            error: '输入必须是数字且最多保留一位小数',
            success: "It's floorNum"
        },
        minlength: {
            error: '输入小于最小长度',
            success: 'Long enough!'
        },
        maxlength: {
            error: '输入超出最大长度',
            success: 'Short enough!'
        },
        //以下是自定义验证方法提示
        null: {
            error: '可以为空',
            success: ' is null!'
        },
        nulldate: {
            error: '输入必须是数字',
            success: ' is nullnumber!'
        },
        idcard: {
            error: '输入必须是身份证号码',
            success: ' is idcard!'
        },
        nullidcard: {
            error: '输入必须是身份证号码',
            success: ' is idcard!'
        },
        phonenumber: {
            error: '输入必须是电话号码格式',
            success: ' is phonenumber!'
        },
        nullphonenumber: {
            error: '输入必须是电话号码格式',
            success: ' is nullphonenumber!'
        },
        nullAreaNumber: {
            error: '输入必须是数字且格式为整数1~11位+小数点0~2位',
            success: ' is nullnumber!'
        },
        AreaNumber: {
            error: '输入必须是大于0的数字且格式为整数1~11位+小数点0~2位',
            success: ' is nullnumber!'
        },
        nullFloorNum: {
            error: '输入必须是数字且最多保留两位小数',
            success: ' is nullnumber!'
        },
        nullMoney: {
            error: '输入必须是数字且格式为整数1~11位+小数点0~4位',
            success: ' is nullnumber!'
        },
        lessOrEqual: {
            error: 'replaceText',
            success: 'success'
        },
        moreOrEqual: {
            error: 'replaceText',
            success: 'success'
        },
        ledgerYear: {
            error: '请输入正确的台账年份',
            success: ' is ledgerYear!'
        },
        ledgerMonth: {
            error: '请输入正确的台账月度',
            success: ' is ledgerMonth!'
        },
        areaLimit: {
            error: '建筑面积不能小于占地面积',
            success: 'success'
        },
        pattern: {
            error: '',
            success: 'success'
        },
        Characters: {
            error: '只能输入汉字且至少输入3个汉字',
            success: 'success'
        },
        nullCharacters: {
            error: '只能输入汉字且至少输入3个汉字',
            success: 'success'
        },
        SJYTcode: {
            error: '地类编码只能输入4个数字',
            success: 'success'
        },
        'custom-validator': {
            error: '必填',
            success: 'success'
        },
        tbbsm: {
            error: '更新层图斑标识码只能输入数字和字母',
            success: 'success'
        },
        tbbh: {
            error: '必填',
            success: 'success'
        },
        pzwh: {
            error: '批准文号不符合规则',
            success: 'success'
        },
        dylAreaNumber: {
            error: '图斑面积必须大于0',
            success: 'success'
        },
        password: {
            error: '密码长度不少于12位，且必须包含字母和数字。',
            success: 'success'
        }
    };

    //#endregion
    private runCount: number = 0;

    ngAfterViewInit() {
        this.defaultMsg.pattern.error = this.message
            ? this.message
            : '未指定错误消息';

        //父元素设置相对定位
        $(this.el.nativeElement)
            .parent()
            .css('position', 'relative');
        var name = $(this.el.nativeElement)
            .prop('tagName')
            .toLowerCase();
        var preheight = 0;
        if (name == 'textarea') {
            preheight = $(this.el.nativeElement)
                .prev()
                .height();
        }
        let tipTop = $(this.el.nativeElement).height() + 13 + preheight;
        tipTop = tipTop == 13 ? 35 : tipTop;
        let prevAllList = $(this.el.nativeElement).prevAll();
        let prevAllWidth = 0;
        for (var i = 0; i < prevAllList.length; i++) {
            prevAllWidth += prevAllList[i].offsetWidth;
        }
        let tipLeft = prevAllWidth + 5;
        this.tips = $(
            '<div class="vtooltip bottom  bottom-left" style="top: ' +
            tipTop +
            'px; right:0;opacity:1">' +
            '<div class="vtooltip-arrow" style="position:absolute"></div>' +
            '<div class="vtooltip-inner"></div></div>'
        );
        this.tips.hide();
        $(this.el.nativeElement).after(this.tips);

        // $(document).ready(() => {
        this.isLoaded = true;
        if (this.type) {

            if (this.isBulr == 0) {
                this.ngModel.valueChanges.subscribe(v => {
                    if (v) {
                        this.validationValue();
                    }
                });
            }


        }

        function test(this: GlobalEventHandlers, ev: MouseEvent) {
            that.validationValue();
        }

        if (this.isBulr == 1) {
            var that = this;
            let nameT = that.ngModelname();

            setTimeout(() => {
                let test = document.getElementsByName(nameT)[0];

                test.onmouseout = () => {
                    that.validationValue();
                }

                test.onmouseenter = () => {
                    this.HideErrorTip();
                }

            }, 1000);


        }



        // });
    }

    ngOnDestroy(): void {
        this.HideErrorTip();
    }

    onValidation() {
        if (!this.type) {
            this.ngModel.valueChanges.subscribe(v => {
                this.HideErrorTip();
            });
        }
    }

    public validationValue(isTemporary?) {
        let isValid = true;
        if (this.validation) {
            var ngModelVal = $.trim(this.ngModel.value);
            if (
                typeof this.ngModel.value === 'string' &&
                ngModelVal != this.ngModel.value
            ) {
                this.ngModel.control.setValue(ngModelVal);
            }
            // if(!ngModelVal){
            //   this.ngModel.control.setErrors({ "required": true });
            // }
            if (this.ngModel.errors && !isTemporary) {
                // && (this.ngModel.errors.pattern || this.ngModel.errors.required)
                for (const key in this.ngModel.errors) {
                    if (this.ngModel.errors[key]) {
                        isValid = false;
                        let errorMessage = '';
                        if (this.defaultMsg[key]) {
                            let tipExtend = key == "maxlength" ? this.maxLength : "";
                            errorMessage += this.defaultMsg[key].error + tipExtend;
                        } else {
                            errorMessage += key + '：未指定错误消息';
                        }
                        this.ShowErrorTip(errorMessage);
                    } else {
                        this.HideErrorTip();
                    }
                }
            } else {
                if (this.type) {

                    let flag = false;
                    if (this.type == "maxlength") {
                        flag = this.exPressionExtend[this.type](this.ngModel.value, this.maxLength)
                    } else {
                        flag = this.expression[this.type](this.ngModel.value)
                    }
                    if (flag) {
                        //value对比
                        let theMaxValue =
                            this.maxValue || this.maxValue == 0
                                ? this.maxValue
                                : isNaN(this.maxValue)
                                    ? 0
                                    : null;
                        let theMinValue =
                            this.minValue || this.minValue == 0
                                ? this.minValue
                                : isNaN(this.minValue)
                                    ? 0
                                    : null;
                        if ((theMinValue || theMinValue == 0) && this.message) {
                            if (Number(this.ngModel.model) < Number(theMinValue)) {
                                if (this.type == 'nulldate' && !this.ngModel.model) {
                                    //时间格式特殊处理，为空不进行比较
                                    this.HideErrorTip();
                                } else {
                                    isValid = false;
                                    this.ShowErrorTip(this.message);
                                }
                            } else {
                                if (theMaxValue || theMaxValue == '') {
                                    if (Number(this.ngModel.model) > Number(theMaxValue)) {
                                        isValid = false;
                                        this.ShowErrorTip(this.message);
                                    } else {
                                        this.HideErrorTip();
                                    }
                                } else {
                                    this.HideErrorTip();
                                }
                            }
                        } else if ((theMaxValue || theMaxValue == 0) && this.message) {
                            if (Number(this.ngModel.model) > Number(theMaxValue)) {
                                isValid = false;
                                this.ShowErrorTip(this.message);
                            } else {
                                this.HideErrorTip();
                            }
                        } else {
                            this.HideErrorTip();
                        }
                    } else {
                        isValid = false;

                        let tipExtend = this.type == "maxlength" ? this.maxLength : "";
                        let errorMessage = this.defaultMsg[this.type].error + tipExtend;
                        this.ShowErrorTip(errorMessage);
                    }
                } else {
                    this.HideErrorTip();
                }
            }
        }
        if (!isTemporary) {
            this.onValidation();
        }
        return isValid;
    }

    constructor(
        private el: ElementRef,
        renderer2: Renderer2,
        private ngModel: NgModel
    ) { }

    ShowErrorTip(msg) {
        if (!$(this.el.nativeElement).is(':hidden')) {
            // if(this.el.nativeElement.localName=""){

            // }else{
            $(this.el.nativeElement).addClass('ng2-invalid');
            // }

            this.tips.find('.vtooltip-inner').html(msg);

            Object.assign(this.ngModel, {
                custom: {
                    errorTip: this.tips,
                    sourceElement: $(this.el.nativeElement)
                }
            });

            this.tips.show();
            //auto location
            if (this.tips && this.tips.length > 0) {
                setTimeout(() => {
                    let first_error_tip = $('.ng2-invalid:first')[0];
                    if (first_error_tip) {
                        // first_error_tip.parentElement.scrollIntoView({ block: 'start', behavior: 'smooth' });
                    }
                }, 0);
                // this.tips[0].scrollIntoView(false)
            }

            // console.log(`元素位置 x: ${$(this.el.nativeElement).position().left}   y:  ${$(this.el.nativeElement).position().top}`);
            //console.log(`tip 位置 x: ${this.tips.position().left}   y:  ${this.tips.position().top}`);
        } else {
            this.HideErrorTip();
        }
    }

    HideErrorTip() {
        if (this.connectLess && this.connectLess.ngModel.model) {
            if (Number(this.connectLess.ngModel.model) > Number(this.ngModel.model)) {
                this.connectLess.ShowErrorTip(this.connectLess.message);
            } else {
                this.connectLess.HideErrorTip();
            }
        } else if (this.connectMore && this.connectMore.ngModel.model) {
            if (Number(this.connectMore.ngModel.model) < Number(this.ngModel.model)) {
                this.connectMore.ShowErrorTip(this.connectMore.message);
            } else {
                this.connectMore.HideErrorTip();
            }
        }
        $(this.el.nativeElement).removeClass('ng2-invalid');

        if (this.tips) {
            this.tips.hide();
        }
    }

    ngModelname() {
        return this.ngModel.name;
    }
}
