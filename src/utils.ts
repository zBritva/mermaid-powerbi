import powerbiVisualsApi from "powerbi-visuals-api";
import PrimitiveValue = powerbiVisualsApi.PrimitiveValue;
import DataView = powerbiVisualsApi.DataView;
import ISelectionId = powerbiVisualsApi.visuals.ISelectionId;
import DataViewMetadataColumn = powerbiVisualsApi.DataViewMetadataColumn;
import IVisualHost = powerbiVisualsApi.extensibility.visual.IVisualHost;

import { utcParse } from "d3-time-format";

import { Config as DompurifyConfig, sanitize } from "dompurify";

export const defaultDompurifyConfig = <DompurifyConfig>{
    RETURN_DOM: false,
    SANITIZE_DOM: true,
    ALLOW_ARIA_ATTR: true,
    ALLOWED_ATTR: [
        'data-*'
    ],
    ALLOW_UNKNOWN_PROTOCOLS: false,
    USE_PROFILES: {svg: true, svgFilters: true, html: true, mathMl: false},
    // ALLOWED_TAGS: [],
    FORBID_ATTR: [
        'href',
        'url',
        'onafterprint',
        'onbeforeprint',
        'onbeforeunload',
        'onerror',
        'onhashchange',
        'onload',
        'onmessage',
        'onoffline',
        'ononline',
        'onpagehide',
        'onpageshow',
        'onpopstate',
        'onresize',
        'onstorage',
        'onunload',
        'onblur',
        'onchange',
        'onfocus',
        'oninput',
        'oninvalid',
        'onreset',
        'onsearch',
        'onselect',
        'onsubmit',
        'onkeydown',
        'onkeypress',
        'onkeyup',
        'onclick',
        'ondblclick',
        'onmousedown',
        'onmousemove',
        'onmouseout',
        'onmouseover',
        'onmouseup',
        'onmousewheel',
        'onwheel',
        'oncopy',
        'oncut',
        'onpaste',
        'onabort',
        'oncanplay',
        'oncanplaythrough',
        'oncuechange',
        'ondurationchange',
        'onemptied',
        'onended',
        'onerror',
        'onloadeddata',
        'onloadedmetadata',
        'onloadstart',
        'onpause',
        'onplay',
        'onplaying',
        'onprogress',
        'onratechange',
        'onseeked',
        'onseeking',
        'onstalled',
        'onsuspend',
        'ontimeupdate',
        'onvolumechange',
        'onwaiting',
    ],
    FORBID_TAGS: ['script', 'iframe', 'object', 'param', 'source', 'video'],
};

export type Column = Pick<DataViewMetadataColumn, "displayName" | "index">;

export interface Row {
    [key: string]: PrimitiveValue | ISelectionId
    selection?: ISelectionId
}

export interface Table {
    rows: Row[];
    columns: Column[];
}

export function sanitizeHTML(dirty: string) {
    return sanitize(dirty, defaultDompurifyConfig) as string;
}

export function safeParse(echartJson: string): any {
    let chart: any = {};

    try {
        chart = echartJson ? JSON.parse(echartJson) : {};
    } catch (e) {
        console.log(e.message);
    }

    return chart;
}

export function getChartColumns(echartJson: string): string[] {
    if (!echartJson) {
        return [];
    }
    const chart = safeParse(echartJson);

    if (chart.dataset) {
        if (chart.dataset.dimensions && chart.dataset.dimensions instanceof Array) {
            const columns = [];
            chart.dataset.dimensions.forEach((dimension: string | Record<string, string>) => {
                if (typeof dimension === 'string') {
                    columns.push(dimension);
                } else {
                    columns.push(dimension.name);
                }
            });

            return columns;
        }
        if (chart.dataset.source[0]) {
            return chart.dataset.source[0];
        }
    }

    return [];
}

export function walk(key: string, tree: Record<string, unknown | unknown[]> | unknown, apply: (key: string, value: any) => void) {
    if (typeof tree !== 'object') {
        apply(key, tree);
        return;
    }
    for (const key in tree) {
        if (tree[key] instanceof Array) {
            const array = tree[key] as Array<unknown>;
            array.forEach((el, index) => {
                apply(index.toString(), el);
                walk(index.toString(), el, apply);
            });
        } else {
            apply(key, tree[key]);
            if (tree[key] instanceof Object) {
                walk(key, tree[key], apply);
            }
        }

    }
}


export function convertData(dataView: DataView, host?: IVisualHost): Table {
    const table: Table = {
        rows: [],
        columns: []
    };

    if (!dataView || !dataView.table) {
        return table
    }

    const dateParse = utcParse('%Y-%m-%dT%H:%M:%S.%LZ');
    dataView.table.rows.forEach((data, rowIndex) => {
        const selection = host
            ?.createSelectionIdBuilder()
            .withTable(dataView.table, rowIndex)
            .createSelectionId();
        
        const row = {
            selection
        };
        dataView.table.columns.forEach((col, index) => {
            if (col.type.dateTime || col.type.temporal) {
                row[col.displayName] = dateParse(data[index] as string);
            } else {
                row[col.displayName] = data[index];
            }
        })

        table.rows.push(row)
    })

    table.columns = dataView.table.columns.map(c => ({
        displayName: c.displayName,
        index: c.index
    }))

    return table;
}

export function deepClone(object: unknown) {
    return JSON.parse(JSON.stringify(object))
}