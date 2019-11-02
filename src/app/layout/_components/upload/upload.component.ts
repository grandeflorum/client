import { Component, OnInit, Input , ViewChildren, QueryList } from '@angular/core';
import { Router , ActivatedRoute} from '@angular/router';
import { UploadChangeParam } from 'ng-zorro-antd/upload';
import { NzModalService, NzTreeNodeOptions,NzMessageService ,UploadXHRArgs ,UploadFile } from 'ng-zorro-antd';
import { HttpClient, HttpEvent, HttpEventType, HttpRequest, HttpResponse } from '@angular/common/http';
import * as Moment from 'moment';
import * as $ from 'jquery';

@Component({
  selector: 'app-upload',
  templateUrl: './upload.component.html',
  styleUrls: ['./upload.component.scss']
})
export class uploadComponent implements OnInit {
  @Input() accept = "xls,xlsx,doc,pdf,docx,image/png,image/jpg,image/jpeg,image/gif,image/bmp";
  @Input() type = "1";//1 开发项目管理

  uploadFileUrl = "";
  fileList: UploadFile[] = [];
  formData:any;

  constructor(
    private msg: NzMessageService,
    private router:Router,
    private activatedRoute:ActivatedRoute,
    private http:HttpClient
  ) {}

  ngOnInit() {
    this.formData = new FormData();
  }

  beforeUpload = (file: UploadFile): boolean => {
    var fileName = file.name.split('.');
    var fileType = fileName[fileName.length - 1];
    if(this.type == '1'){
      const isZIP = (fileType == 'xls' || fileType == 'xlsx' || fileType == 'doc' || fileType =='docx' || fileType =='pdf' || fileType =='png' || fileType =='jpg' || fileType =='jpeg' || fileType =='bmp');
      if (!isZIP) {
        this.msg.error('请上传word,excel,pdf,png,jpg,bmp格式文件');
        return false;
      }
    }
    this.fileList = this.fileList.concat(file);

    return false;
  };

  import(){
    
    const formData = new FormData();

    if(this.fileList.length == 0){
      this.msg.warning('请选择需要上传的文件');
    }else{
      this.fileList.forEach((file: any) => {
        formData.append('files[]', file);
      });
    }
    
    const req = new HttpRequest('POST', this.uploadFileUrl, formData, {
      reportProgress: true,
      withCredentials: false
    });
    this.http.request(req).subscribe(
      (event: HttpEvent<{}>) => {
        // if (event.type === HttpEventType.UploadProgress) {
        //   if (event.total! > 0) {
        //     (event as any).percent = (event.loaded / event.total!) * 100;
        //   }
        //   this.file.onProgress!(event, this.file.file!);
        // } else if (event instanceof HttpResponse) {
        //   this.file.onSuccess!(event.body, this.file.file!, event);
        // }

        if (event instanceof HttpResponse) {
             var res:any = event.body;
             if(res.success){

              if(this.type == '1'){
                
                  
              }



             }else{
               this.msg.error(res.msg)
             }
           }


      },
      err => {
      }
    );
  }

  deleteFile= (file: UploadFile) => {
    var index = this.fileList.findIndex(x=>x.uid == file.uid);
    this.fileList.splice(index,1);
  }

  reset(){
      this.fileList = [];
  }

 ngAfterViewInit() {}

}