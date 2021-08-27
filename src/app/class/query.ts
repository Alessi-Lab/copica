import {DataFrame, IDataFrame} from "data-forge";

export class Query {

  df: IDataFrame<number, any> = new DataFrame<number, any>()
  IntensityCols: string[] = []
  IdentifierCol: string = ""
  MolecularMassCol: string = ""
  GeneNameCol: string = ""
  Ploidy: number = 2
}
