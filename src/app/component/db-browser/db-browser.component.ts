import {Component, EventEmitter, OnInit, Output} from '@angular/core';
import {WebService} from "../../service/web.service";
import {DataFrame, IDataFrame} from "data-forge";
import {FormBuilder, FormGroup} from "@angular/forms";

@Component({
  selector: 'app-db-browser',
  templateUrl: './db-browser.component.html',
  styleUrls: ['./db-browser.component.css']
})
export class DbBrowserComponent implements OnInit {
  dataframe: IDataFrame = new DataFrame();

  form: FormGroup = this.fb.group({
    cellType: "",
    experimentType: "",
    organisms: ""
  });
  filename: any[] = []
  organisms: any[] = []
  cellType: any[] = []
  oDataframe: any[] = [];
  experiment: any[] = []
  temp: any[] = [];
  selectedFile = "";
  @Output() selectedDataframe: EventEmitter<IDataFrame> = new EventEmitter<IDataFrame>()

  constructor(private http: WebService, private fb: FormBuilder) {
    this.http.getIndex().subscribe(data => {
      this.dataframe = new DataFrame(<Object>data.body)
      this.oDataframe = this.dataframe.toArray();
      for (const a of this.oDataframe) {
        if (!this.organisms.includes(a["Organisms"])) {
          this.organisms.push(a["Organisms"])
        }
      }

      this.temp = this.oDataframe
      const firstEntry = this.dataframe.first()
      this.form.setValue({cellType: firstEntry["Cell type"], experimentType: firstEntry["Experiment Type"], organisms: firstEntry["Organisms"]})
      //this.selectedFile = firstEntry["File"]
      this.updateExperimentType()
      this.updateCellType()

    })


  }

  updateExperimentType() {
    this.experiment = []
    for (const a of this.oDataframe) {
      if (a["Organisms"] == this.form.value["organisms"]) {
        if (!this.experiment.includes(a["Experiment Type"])) {
          this.experiment.push(a["Experiment Type"])
        }
      }
    }
    this.updateFormValue("experimentType")
  }

  updateCellType() {
    this.cellType = []
    this.selectedFile = ""
    for (const a of this.oDataframe) {
      if (a["Organisms"] == this.form.value["organisms"] && a["Experiment Type"] == this.form.value["experimentType"]) {
        console.log(a)
        if (!this.cellType.includes(a["cellType"])) {
          if (this.selectedFile == "") {
            this.selectedFile = a["File"]
          }
          this.cellType.push(a["Cell type"])
        }
      }
    }
    this.updateFormValue("cellType")

  }

  updateFormValue(target: string) {
    const a = {organisms: this.form.value["organisms"], experimentType: this.form.value["experimentType"], cellType: this.form.value["cellType"]}
    switch (target) {
      case "experimentType": {
        a[target] = this.experiment[0]
        break;
      }
      case "organisms": {
        a[target] = this.organisms[0]
        break;
      }
      case "cellType": {
        a[target] = this.cellType[0]
        break;
      }
      default:
        break;
    }
    this.form.setValue(a)
  }


  selectCellType() {
    for (const a of this.oDataframe) {
      if (a["Organisms"] == this.form.value["organisms"] &&
        a["Experiment Type"] == this.form.value["experimentType"] &&
        a["Cell type"] == this.form.value["cellType"]) {
        console.log(this.selectedFile)
        this.selectedFile = a["File"]
        break
      }
    }
    //this.http.getDBjson(this.form.value[""])
  }

  loadVisual() {
    this.http.getDBjson(this.selectedFile).subscribe(data => {
      this.selectedDataframe.emit(new DataFrame(<Object>data.body));
    })

  }

  downloadSelected() {

  }

  ngOnInit(): void {
  }


}
