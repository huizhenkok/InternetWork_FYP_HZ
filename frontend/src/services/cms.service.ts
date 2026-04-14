import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http'; // 🌟 引入 HttpHeaders
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CmsService {
  // 🌟 已更新为云端 API
  private apiUrl = 'https://internetwork-fyp-hz.onrender.com/api/cms';

  constructor(private http: HttpClient) {}

  getCmsData(pageKey: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${pageKey}`);
  }

  saveCmsData(pageKey: string, jsonContent: string): Observable<any> {
    // 🌟 给请求加上 Content-Type 通行证，明确告诉后端这是 JSON
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(`${this.apiUrl}/${pageKey}`, jsonContent, { headers });
  }
}
