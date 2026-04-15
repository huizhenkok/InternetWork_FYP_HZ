import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CmsService {
  // 🌟 已更新为本地 cPanel Node.js 路径
  private apiUrl = 'https://internetworks.my/api/cms';

  constructor(private http: HttpClient) {}

  getCmsData(pageKey: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/${pageKey}`);
  }

  saveCmsData(pageKey: string, jsonContent: string): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(`${this.apiUrl}/${pageKey}`, jsonContent, { headers });
  }
}
