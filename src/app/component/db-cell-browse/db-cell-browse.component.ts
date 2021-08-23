import { Component, OnInit } from '@angular/core';
import {DataFrame, IDataFrame} from "data-forge";
import * as dataforge from "data-forge"
import {WebService} from "../../service/web.service";
import {BehaviorSubject, Observable} from "rxjs";
import {FormBuilder} from "@angular/forms";

@Component({
  selector: 'app-db-cell-browse',
  templateUrl: './db-cell-browse.component.html',
  styleUrls: ['./db-cell-browse.component.css']
})
export class DbCellBrowseComponent implements OnInit {
  dda: boolean = true;
  dia: boolean = true;
  indDataframe: IDataFrame = new DataFrame();
  dataArray: IDataFrame[] = []
  geneList: string[] = []
  organism: string[] = []
  experiment: string[] = []
  dataMap: any = {}
  dfMap: any = {}
  fileLoaded: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false)
  fileLoadedObserver: Observable<boolean> = this.fileLoaded.asObservable()
  selectedData: IDataFrame = new DataFrame();
  form = this.fb.group({
    organisms: "",
    experiment: "",
    dda: true,
    dia: true
  });

  constructor(private http: WebService, private fb: FormBuilder) {
    this.http.getIndexText().subscribe(data => {
      this.indDataframe = dataforge.fromCSV(<string>data.body)
      const first = this.indDataframe.first();
      console.log(first)
      this.form.setValue({
        organisms: first["Organisms"],
        experiment: first["Experiment type"],
        dia: true,
        dda: true},
        )

      this.organism = this.indDataframe.getSeries("Organisms").distinct().bake().toArray()
      //this.experiment = this.indDataframe.getSeries("Experiment Type").distinct().bake().toArray()

      const rowNumb = this.indDataframe.getSeries("File").bake().count()

      this.getData();
    })
  }

  getData() {
    let co = 0
    const rfile = []
    this.dataMap = {}
    this.dfMap = {}
    this.experiment = []
    for (const r of this.indDataframe) {
      let get = false;
      if (r["Acquisition Method"] == "DDA") {
        if (this.form.value["dda"]) {
          get = true
        }
      } else if (r["Acquisition Method"] == "DIA") {
        if (this.form.value["dia"]) {
          get = true

        }
      }

      if (get) {
        rfile.push(r)
        if (!(r["Organisms"] in this.dataMap)) {
          this.dataMap[r["Organisms"]] = {}
          this.dfMap[r["Organisms"]] = {}
        }
        if (!(r["Experiment type"] in this.dataMap[r["Organisms"]])) {
          this.dataMap[r["Organisms"]][r["Experiment type"]] = []
          this.dfMap[r["Organisms"]][r["Experiment type"]] = new DataFrame();

        }
      }
    }
    for (const r of rfile) {
      this.http.getDBtext(r["File"]).subscribe(data => {
        co++
        const a = dataforge.fromCSV(<string>data.body)
        this.dataMap[r["Organisms"]][r["Experiment type"]].push(a)
        if (co === rfile.length) {
          console.log("concat")
          for (const o in this.dataMap) {
            console.log(o)
            for (const e in this.dataMap[o]) {
              this.dfMap[o][e] = DataFrame.concat(this.dataMap[o][e]).bake()
            }
          }

          for (const e in this.dfMap[r["Organisms"]]) {
            this.experiment.push(e)
          }
          this.form.setValue({
            organisms: r["Organisms"],
            experiment: this.experiment[0],
            dda: this.form.value["dda"],
            dia: this.form.value["dia"]
          })
          this.selectData()
          //this.geneList = this.entireData.getSeries("Gene names").distinct().bake().toArray()
          this.fileLoaded.next(true);
          console.log(this.dfMap);
        }
      })
    }
  }

  ngOnInit(): void {

  }

  updateExperimentType() {
    console.log(this.form.value)

    const experiment: string[] = []

    for (const i in this.dfMap[this.form.value["organisms"]]) {
      experiment.push(i)
    }
    this.experiment = experiment;
    this.form.setValue({
      organisms: this.form.value["organisms"],
      experiment: experiment[0],
      dda: true,
      dia: true
    })
    this.selectData()
  }

  updateCellType() {
    this.selectData()
  }

  selectData() {
    console.log("select data")
    this.selectedData = this.dfMap[this.form.value["organisms"]][this.form.value["experiment"]]

  }
}
