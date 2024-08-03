import powerbiVisualsApi from "powerbi-visuals-api";
import VisualUpdateOptions = powerbiVisualsApi.extensibility.visual.VisualUpdateOptions;
import DataView = powerbiVisualsApi.DataView;
import IVisualHost = powerbiVisualsApi.extensibility.visual.IVisualHost;
import IViewport = powerbiVisualsApi.IViewport;

import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import { IVisualSettings, VisualSettings } from "../settings";

export interface Dataset {

}

export interface VisualState {
    host: IVisualHost;
    options: VisualUpdateOptions;
    settings: IVisualSettings;
    dataset: Dataset;
    dataView: DataView;
    viewport: IViewport;
    template: string;
    mode: powerbi.EditMode;
}

const initialState: VisualState = {
    host: undefined,
    options: undefined,
    settings: VisualSettings.getDefault() as VisualSettings,
    dataset: {},
    dataView: null,
    viewport: {
        height: 0,
        width: 0
    },
    template: '',
    mode: powerbi.EditMode.Default
}

export const slice = createSlice({
    name: 'options',
    initialState,
    reducers: {
        setHost: (state, action: PayloadAction<IVisualHost>) => {
            state.host = action.payload
        },
        setViewport: (state, action: PayloadAction<IViewport>) => {
            state.viewport = action.payload
        },
        setDataView: (state, action: PayloadAction<DataView>) => {
            state.dataView = action.payload

            // state.dataView.table.columns[0].displayName
        },
        // setOptions: (state, action: PayloadAction<VisualUpdateOptions>) => {
        //     state.options = action.payload;
        //     if (!state.options.dataViews[0]) {
        //         return;
        //     }
        //     state.dataView = state.options.dataViews[0];
        //     // state.dataset = createDataset(state.dataView);
        // },
        setSettings: (state, action: PayloadAction<IVisualSettings>) => {
            state.settings = action.payload;

            state.template = state.settings.template.chunk0
                .concat(state.settings.template.chunk1)
                .concat(state.settings.template.chunk2)
                .concat(state.settings.template.chunk3)
                .concat(state.settings.template.chunk4)
                .concat(state.settings.template.chunk5)
                .concat(state.settings.template.chunk6)
                .concat(state.settings.template.chunk7)
                .concat(state.settings.template.chunk8)
                .concat(state.settings.template.chunk9)
                .concat(state.settings.template.chunk10)
        },
        setMode: (state, action: PayloadAction<powerbi.EditMode>) => {
            state.mode = action.payload;
        }
    },
})

// Action creators are generated for each case reducer function
export const { setHost, setDataView, setSettings, setViewport, setMode } = slice.actions

export default slice.reducer