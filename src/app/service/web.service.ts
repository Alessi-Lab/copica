import { Injectable } from '@angular/core';
import {HttpClient, HttpResponse} from "@angular/common/http";
import {Observable, throwError} from "rxjs";
import {catchError, retry} from "rxjs/operators";
import {HistoneItem} from "../class/histone-item";

@Injectable({
  providedIn: 'root'
})
export class WebService {
  private _filters: any = {Kinases: "kinases.txt", Lrrk2: "lrrk2.txt", Phosphatases: "phosphatases.txt"}
  filters: any = {}
  constructor(private http: HttpClient) { }

  getOrganisms() : Observable<HistoneItem[]> {
    return this.http.get<HistoneItem[]>("assets/organisms.json", {observe: "body"})
  }

  getExampleInput() {
    return this.http.get("assets/proteinGroups.txt", {observe: "response", responseType: "text"})
  }

  getIndex() {
    return this.http.get("assets/index.json", {observe: "response"})
  }

  getDBjson(filename: string) {
    return this.http.get("assets/" + filename, {observe: "response"})
  }

  getFilter() {
    for (const i in this._filters) {
      if (!(i in this.filters)) {
        this.filters[i] = []
      }
      this.http.get("assets/" + this._filters[i], {observe: "response", responseType: "text"}).subscribe(data => {
        const a = data.body?.split("\n")
        if (a) {
          for (const n of a) {
            this.filters[i].push(n.trim())
          }
        }
      })
    }
  }
}