import React from 'react';

// import powerbiApi from "powerbi-visuals-api";

import { useAppSelector } from './redux/hooks';
// import { setSettings } from './redux/slice';
// import { IVisualSettings } from './settings';
import { convertData } from './utils';
import MDEditor from '@uiw/react-md-editor';
import rehypeSanitize from "rehype-sanitize";

import Handlebars from "handlebars";

import { Editor, Code } from './Editor';

import './helpers';
import { hardReset } from './helpers';

import { ErrorBoundary } from './Error';

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const mermaid = require("../node_modules/mermaid/dist/mermaid.js");

// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface ApplicationProps {
}

/* eslint-disable max-lines-per-function */
export const Application: React.FC<ApplicationProps> = () => {

    // const settings = useAppSelector((state) => state.options.settings);
    // const option = useAppSelector((state) => state.options.options);
    const host = useAppSelector((state) => state.options.host);

    const dataView = useAppSelector((state) => state.options.dataView);
    const viewport = useAppSelector((state) => state.options.viewport);
    const templateSource = useAppSelector((state) => state.options.template);
    const editMode = useAppSelector((state) => state.options.mode);
    const [isSaved, setIsSaved] = React.useState<boolean>(true);
    const [value, setValue] = React.useState<string>(null);

    React.useEffect(() => {
        if (templateSource.trim() !== '' && value === null) {
            setValue(templateSource)
        }
    }, [value, setValue, templateSource]);

    const onChangeValue = React.useCallback((value: string) => {
        setValue(value)
        setIsSaved(false);
    }, [setValue, value]);

    const onOpenUrl = React.useCallback((e: React.MouseEvent<HTMLAnchorElement>) => {  
        host.launchUrl((e.target as HTMLElement).getAttribute('href'));
        e.preventDefault();
        e.stopPropagation();
    }, [host]);

    const selectionManager = React.useMemo(() => {
        return host.createSelectionManager();
    }, [host]);

    const template = React.useMemo(() => {
        return Handlebars.compile(templateSource);
    }, [templateSource]);

    const table = React.useMemo(() => convertData(dataView, host), [dataView, convertData, host])

    React.useEffect(() => {
        const clickableElements = document.querySelectorAll<HTMLElement | SVGElement>('[data-selection=true],[data-selection=false]')
        const selectionClear = document.querySelectorAll<HTMLElement | SVGElement>('[data-selection-clear=true]')
        const launchUrlElements = document.querySelectorAll<HTMLElement | SVGElement>('[data-launch-url=true]')
        
        const clearHandlers = []
        selectionClear.forEach(clear => {
            const handler = clear.addEventListener('click', (e) => {
                selectionManager.clear().then(() => {
                    clickableElements.forEach(e => e.setAttribute('data-selection', 'true'))
                })
                e.preventDefault()
                e.stopPropagation()
            })

            clearHandlers.push(handler)
        })

        const selectionHandlers = []
        const contextMenuHandlers = []
        const launchUrlHandlers = []

        clickableElements.forEach(element => {
            const handler = element.addEventListener('click', function (e) {
                const dataIndex = element.getAttribute('data-index')
                if (table.rows[dataIndex]) {
                    const selection = table.rows[dataIndex].selection
                    selectionManager
                        .select(selection)
                        .then(selections => {
                            if (selections.length === 0) {
                                clickableElements.forEach(e => e.setAttribute('data-selection', 'true'))
                            } else {
                                // reset all
                                clickableElements.forEach(e => e.setAttribute('data-selection', 'false'))
                                // set selected
                                element.setAttribute('data-selection', 'true')
                            }
                        })
                    e.preventDefault()
                    e.stopPropagation()
                }
            })
            selectionHandlers.push(handler)

            const contextMenuHandler = element.addEventListener('contextmenu', function (e: MouseEvent) {
                const dataIndex = element.getAttribute('data-index')
                if (table.rows[dataIndex]) {
                    const selection = table.rows[dataIndex].selection
                    selectionManager
                        .showContextMenu(selection, {
                            x: e.clientX,
                            y: e.clientY
                        });
                    e.preventDefault()
                    e.stopPropagation()
                }
            });
            contextMenuHandlers.push(contextMenuHandler)
        })

        launchUrlElements.forEach(element => {
            const handler = element.addEventListener('click', function (e) {
                const url = element.getAttribute('data-url')
                e.preventDefault()
                e.stopPropagation()
                host.launchUrl(decodeURIComponent(url))
            })
            launchUrlHandlers.push(handler)
        });

        return () => {
            clickableElements.forEach((element, index) => {
                element.removeEventListener('click', selectionHandlers[index])
            })
            clickableElements.forEach((element, index) => {
                element.removeEventListener('contextmenu', contextMenuHandlers[index])
            })
            selectionClear.forEach((element, index) => {
                element.removeEventListener('click', clearHandlers[index])
            })
            launchUrlElements.forEach((element, index) => {
                element.removeEventListener('click', launchUrlHandlers[index])
            })
        }
    }, [host, table, selectionManager])

    const content = React.useMemo(() => {
        hardReset()
        Handlebars.unregisterHelper('useColor')
        Handlebars.registerHelper('useColor', function (val: string) {
            return host.colorPalette.getColor(val).value
        })
        Handlebars.unregisterHelper('useSelection')
        Handlebars.registerHelper('useSelection', function (index: number) {
            if (table.rows[index] && typeof index === 'number') {
                return `data-selection=true data-index="${index}"`
            }
        })
        Handlebars.unregisterHelper('useSelectionClear')
        Handlebars.registerHelper('useSelectionClear', function () {
            return `data-selection-clear="true"`
        })
        try {
            return template({
                table,
                viewport
            })
        } catch (err) {
            return `<h4>${err.message}</h4><pre>${err.stack}</pre>`
        }
    }, [host, table, viewport, template])

    const container = React.useRef<HTMLDivElement>(null);

    const clean = content; // React.useMemo(() => sanitizeHTML(content), [content, sanitizeHTML])

    console.log('value == clean', value == clean);

    const onBackgroundContextMenu = React.useCallback((e: React.MouseEvent) => {
        selectionManager.showContextMenu(null, {
            x: e.clientX,
            y: e.clientY
        })
        e.preventDefault()
        e.stopPropagation()
    }, [selectionManager]);

    const onBackgroundClick = React.useCallback((e: React.MouseEvent<HTMLElement>) => {
        if (e.target === container.current) {
            selectionManager.clear()
        } else {
            if ((e.target as any).tagName == 'A') {
                const href = (e.target as HTMLLinkElement).getAttribute('href');
                host.launchUrl(href);
            }
        }
        e.preventDefault()
        e.stopPropagation()
    }, [selectionManager]);

    const onSaveClick = React.useCallback((value: string, e: React.MouseEvent) => {
        const template = value;

        host.persistProperties({
            replace: [
                {
                    objectName: 'template',
                    selector: undefined,
                    properties: {
                        chunk0: template
                    }
                }
            ]
        })

        e?.preventDefault()
        e?.stopPropagation()
        setIsSaved(true);
    }, [host, value]);

    return (<>
        <>
            <ErrorBoundary>
                {templateSource.trim() === '' && editMode === powerbi.EditMode.Default ? (
                    <div className='tutorial'>
                        <h4>Template is empty</h4>
                        <p>Read more about the visual in official documentation:</p>
                        <a onClick={onOpenUrl} href='https://ilfat-galiev.im/docs/markdown-visual/'>https://ilfat-galiev.im/docs/markdown-visual/</a>
                    </div>
                ) : 
                editMode === powerbi.EditMode.Advanced ?
                    <div className='import'>
                        <Editor
                            table={table}
                            value={templateSource}
                            onChange={(value, e) => { onChangeValue(value); onSaveClick(value, e); }}
                            height={viewport.height}
                            width={viewport.width}
                            onBackgroundClick={onBackgroundClick}
                            onBackgroundContextMenu={onBackgroundContextMenu}
                        />
                    </div>:
                    <div
                        ref={container}
                        data-color-mode="light"
                        onClick={onBackgroundClick}
                        onContextMenu={onBackgroundContextMenu}
                        style={{
                            width: viewport.width,
                            height: viewport.height,
                            overflowY: 'scroll'
                        }}
                    >
                        <MDEditor.Markdown
                            components={{
                                code: Code
                            }}
                            rehypePlugins={[[rehypeSanitize]]}
                            source={clean}
                            urlTransform={(url) => {
                                return url;
                            }}
                            // style={{ whiteSpace: 'pre-wrap' }}
                        />
                    </div>
                }
            </ErrorBoundary>
        </>
    </>)

}

