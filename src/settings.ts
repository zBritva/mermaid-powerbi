
"use strict";

import { dataViewObjectsParser } from "powerbi-visuals-utils-dataviewutils";
import DataViewObjectsParser = dataViewObjectsParser.DataViewObjectsParser;

export interface IVisualSettings {
    template: Template;
}

export class VisualSettings extends DataViewObjectsParser implements IVisualSettings {
    public template: Template = new Template();
}

export class Template {
    public chunk0: string = "";
    public chunk1: string = "";
    public chunk2: string = "";
    public chunk3: string = "";
    public chunk4: string = "";
    public chunk5: string = "";
    public chunk6: string = "";
    public chunk7: string = "";
    public chunk8: string = "";
    public chunk9: string = "";
    public chunk10: string = "";
}
