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
        var picType = ['pdf', 'doc', 'txt', 'docx'];
        var res = false;

        picType.forEach(element => {
            if (element == format.toLowerCase()) {
                res = true;
            }
        });

        return res;
    }

    preview(item) {

        if (item && item.response) {
            var url = this.downLoadurl + "?id=" + item.response.msg + "&type=2";

            window.open('assets/usermanual/web/viewer.html?url=' + this.utilitiesSercice.wrapUrl(url), "_blank");
        }


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
        this.uploadComponent.fileList = [];
    }

    //开始上传
    handleOk() {
        this.uploadComponent.import();
    }

    uploadCompelete(data) {
        this.fileList = [...this.fileList, ...data];
        this.isVisible = false;

    }

}
