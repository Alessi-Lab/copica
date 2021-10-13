import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {DataFrame, IDataFrame} from "data-forge";
import {FormBuilder, FormGroup} from "@angular/forms";
import {WebService} from "../../service/web.service";
import {HistoneDb} from "../../class/histone-db";
import {BehaviorSubject, Observable} from "rxjs";
import {Query} from "../../class/query";
import {ActivatedRoute} from "@angular/router";

@Component({
  selector: 'app-db-scatter',
  templateUrl: './db-scatter.component.html',
  styleUrls: ['./db-scatter.component.css']
})
export class DbScatterComponent implements OnInit {
  loadScatterSubject: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  observeScatter: Observable<boolean> = new Observable<boolean>()
  scatterDF: IDataFrame = new DataFrame();
  scatterData: IDataFrame = new DataFrame();
  heatmapData: IDataFrame = new DataFrame();
  constructor(private http: WebService, private route: ActivatedRoute) {
    this.observeScatter = this.loadScatterSubject.asObservable()
  }

  scatterDataHandler(e: IDataFrame) {
    this.scatterData = e;
    this.scatterDF = e;
    console.log(e)
    this.loadScatterSubject.next(true);
  }

  downloadSelectedData(data: IDataFrame) {
    const blob = new Blob([data.toCSV()], {type: 'text/csv'})
    const url = window.URL.createObjectURL(blob);

    if (typeof(navigator.msSaveOrOpenBlob)==="function") {
      navigator.msSaveBlob(blob, "data.csv")
    } else {
      const a = document.createElement("a")
      a.href = url
      a.download = "data.csv"
      document.body.appendChild(a)
      a.click();
      document.body.removeChild(a);
    }
    window.URL.revokeObjectURL(url)
  }

  handleHeatmap(data: IDataFrame) {
    this.heatmapData = data
  }

  ngOnInit() {
    this.route.params.subscribe(res => {
      console.log(res)
      if (res.gene) {
        const g = res.gene.split(",")
        if (g) {
          this.http.scatterData = g
        }
      }
      if (res.datasets) {
        const g = res.datasets.split(",")
        if (g) {
          this.http.scatterFiles = g
        }
      }
    })
  }
}
