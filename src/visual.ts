"use strict";

import React from 'react';
import { Root, createRoot } from 'react-dom/client';
import { Application } from './Application';

import "../style/visual.scss";
import powerbiVisualsApi from "powerbi-visuals-api";
import VisualConstructorOptions = powerbiVisualsApi.extensibility.visual.VisualConstructorOptions;
import VisualUpdateOptions = powerbiVisualsApi.extensibility.visual.VisualUpdateOptions;
import IVisual = powerbiVisualsApi.extensibility.visual.IVisual;
import EnumerateVisualObjectInstancesOptions = powerbiVisualsApi.EnumerateVisualObjectInstancesOptions;
import VisualObjectInstance = powerbiVisualsApi.VisualObjectInstance;
import DataView = powerbiVisualsApi.DataView;
import VisualObjectInstanceEnumerationObject = powerbiVisualsApi.VisualObjectInstanceEnumerationObject;
import IVisualHost = powerbiVisualsApi.extensibility.visual.IVisualHost

import { VisualSettings } from "./settings";

import { Provider } from 'react-redux';
import { store } from "./redux/store";
import { setDataView, setHost, setMode, setSettings, setViewport } from './redux/slice';
import { deepClone } from './utils';


export class Visual implements IVisual {
    private target: HTMLElement;
    private settings: VisualSettings;
    private host: IVisualHost;
    private root: Root;

    constructor(options: VisualConstructorOptions) {
        this.target = options.element;
        this.host = options.host;

        window.open = (url?: string | URL) => {
            if (typeof url === "string") {
                this.host.launchUrl(url);
            }
            return window;
        };

        store.dispatch(setHost(options.host));

        if (document) {
            const reactApplication = React.createElement(Application, {
                key: "root",
            });
            const provider = React.createElement(Provider, {
                store: store,
                key: 'provider',
                children: []
            }, [
                reactApplication
            ]);
            this.root = createRoot(this.target);
            this.root.render(provider);
        }
    }

    public update(options: VisualUpdateOptions) {
        const dataView = options && options.dataViews && options.dataViews[0];
        this.settings = Visual.parseSettings(dataView);
        store.dispatch(setMode(options.editMode));
        store.dispatch(setSettings(this.settings));
        store.dispatch(setDataView(deepClone(options.dataViews[0])));
        store.dispatch(setViewport(deepClone(options.viewport)));
    }

    private static parseSettings(dataView: DataView): VisualSettings {
        return VisualSettings.parse(dataView);
    }

    public enumerateObjectInstances(options: EnumerateVisualObjectInstancesOptions): VisualObjectInstance[] | VisualObjectInstanceEnumerationObject {
        if (options.objectName === 'template') {
            return <VisualObjectInstance[]>[
                {
                    objectName: options.objectName,
                    properties: {}
                }
            ];
        }
        return VisualSettings.enumerateObjectInstances(this.settings || VisualSettings.getDefault(), options);
    }
}
