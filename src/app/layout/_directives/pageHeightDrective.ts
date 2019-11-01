import { Directive, ElementRef, Input, HostListener } from '@angular/core';


//用于 attribute 的 CSS 选择器就是属性名称加方括号。 这里，指令的选择器是[myHighlight]，Angular 将会在模板中找到所有带myHighlight属性的元素。
@Directive({ selector: '[appPageHeight]' })
export class PageHeightDrective {
    private nativeElement: any;
    constructor(private element: ElementRef) {
        this.nativeElement = element.nativeElement;
    }
    @Input('appPageHeight') OffsetHeight: number;
    @Input('type') pageType: number = 1;

    @HostListener('window:resize', ['$event'])
    onResize(event) {
        if(this.pageType==1){
            this.nativeElement.style.height = (event.target.innerHeight - this.OffsetHeight) + 'px';
        }else{
            this.nativeElement.style.height = (event.target.innerHeight - this.OffsetHeight)/2 + 'px';
        }
       
        //console.log('页面变化了'+event.target.innerHeight);
    }


    ngAfterViewInit() {
        if(this.pageType==1){
            this.nativeElement.style.height = (window.innerHeight - this.OffsetHeight) + 'px';
        }else{
            this.nativeElement.style.height = (window.innerHeight - this.OffsetHeight)/2 + 'px';
        }
       
        //console.log('ngAfterViewInit'+window.innerHeight);
    }


}