import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  // 🌟 已更新为云端 API
  private apiUrl = 'https://internetwork-fyp-hz.onrender.com/api/upload';

  constructor(private http: HttpClient) {}

  // 接收一个 File 对象，打包成 FormData 发送给后端
  uploadFile(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file); // 'file' 必须和后端 @RequestParam("file") 名字一致

    return this.http.post(`${this.apiUrl}/image`, formData);
  }
}
