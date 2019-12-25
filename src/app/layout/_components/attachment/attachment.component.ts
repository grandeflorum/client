import { Component, OnInit, Input, ViewChild } from '@angular/core';

import { UploadXHRArgs, NzMessageService } from 'ng-zorro-antd';
import { HttpRequest, HttpClient, HttpEventType, HttpResponse } from '@angular/common/http';
import { AttachmentSercice } from 'src/app/business-modules/service/common/attachment.service';
import { UtilitiesSercice } from 'src/app/business-modules/service/common/utilities.services';


@Component({
    selector: 'app-attachment',
    templateUrl: './attachment.component.html',
    styleUrls: ['./attachment.component.scss']
})
export class AttachmentComponent implements OnInit {

    @Input() fileList = [];
    @Input() isDisable = false;
    @Input() refid = "";

    @ViewChild('uploadComponent', { static: false }) uploadComponent;

    isVisible: any = false;
    isVisiblePic: any = false;
    previewUrl: any = "";
    okText: any = null;

    downLoadurl: any = AppConfig.Configuration.baseUrl + "/FileInfo/download";

    constructor(private attachmentSercice: AttachmentSercice, private http: HttpClient, private utilitiesSercice: UtilitiesSercice,
        private msg: NzMessageService) { }

    ngOnInit() {
    }


    async RemoveAttachment(item) {

        let data = await this.attachmentSercice.deleteFileById(item.uid);

        if (data.code == 200) {

            for (let i = 0; i <= this.fileList.length; i++) {
                if (this.fileList[i].uid == item.uid) {
                    this.fileList.splice(i, 1);
                    break;
                }
            }
        }



    }

    downloadAccessory(item) {
        window.open(this.downLoadurl + "?id=" + item.uid + "&type=1");
    }

    canPreview(fileName) {

        var pos = fileName.lastIndexOf('.');
        var format = fileName.substring(pos + 1);
        var picType = ['png', 'jpg', 'jpeg', 'gif', 'bmp'];
        var res = false;

        picType.forEach(element => {
            if (element == format.toLowerCase()) {
                res = true;
            }
        });

        return res;
    }

    preview(item) {

        // if (item && item.response) {
        //     var url = this.downLoadurl + "?id=" + item.response.msg + "&type=2";

        //     window.open('assets/usermanual/web/viewer.html?url=' + this.utilitiesSercice.wrapUrl(url), "_blank");
        // }

        this.isVisiblePic = true;
        this.previewUrl = this.downLoadurl + "?id=" + item.uid + "&type=1";

    }

    /**
 * 附件
 */
    upload() {
        this.isVisible = true;
        this.uploadComponent.fileList = [];
    }

    handleCancel() {
        this.isVisible = false;
        this.isOkLoading=false;
        this.uploadComponent.fileList = [];
    }
    isOkLoading=false;
    //开始上传
    handleOk() {
        if(this.isOkLoading){
            this.msg.error('附件正在上传，请勿重复点击');
            return;
        }
        this.isOkLoading=true;
        this.uploadComponent.import();
    }

    uploadCompelete(data) {
        this.fileList = [...this.fileList, ...data];
        this.isOkLoading= false;
        this.isVisible = false;

    }

}
