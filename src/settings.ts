
"use strict";

import { dataViewObjectsParser } from "powerbi-visuals-utils-dataviewutils";
import DataViewObjectsParser = dataViewObjectsParser.DataViewObjectsParser;

export interface IVisualSettings {
    template: Template;
    resources: ResourcesSettings;
    view: ViewSettings;
}

export class VisualSettings extends DataViewObjectsParser implements IVisualSettings {
    public template: Template = new Template();
    public resources: ResourcesSettings = new ResourcesSettings();
    public view: ViewSettings = new ViewSettings();
}

export class ResourcesSettings {
    public images: string = "[]";
}

export class ViewSettings {
    public hideDefaultTemplateMessage: boolean = false;
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
