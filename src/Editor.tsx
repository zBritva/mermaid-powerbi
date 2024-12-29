/* eslint-disable max-lines-per-function */
/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import MDEditor, { commands } from '@uiw/react-md-editor/nohighlight';
import rehypeSanitize from "rehype-sanitize";
import { getCodeString } from 'rehype-rewrite';
import { Table } from "./utils";
import Handlebars from "handlebars";

import mermaid from "mermaid";

import { ErrorBoundary } from "./Error";
import { Resource, Resources } from "./Resources";
import { Tabs } from "antd";


export interface EditorProps {
    value: string;
    onChange: (value: string, event?: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
    onSaveResources: (resources: Resource[]) => void;
    onBackgroundClick: (e: React.MouseEvent<HTMLElement>) => void;
    onBackgroundContextMenu: (e: React.MouseEvent) => void;
    launchUrl: (url: string) => void;
    height: number;
    width: number;
    table: Table;
    resources: Resource[];
}

// eslint-disable-next-line powerbi-visuals/insecure-random
const randomid = () => parseInt(String(Math.random() * 1e15), 10).toString(36);

export const Code = (props) => {
    const children = props?.children || [];
    const className = props?.className;
    const demoid = React.useRef(`dome${randomid()}`);
    const [container, setContainer] = React.useState<HTMLElement>(null);

    const isMermaid =
        className && /^language-mermaid/.test(className.toLocaleLowerCase());

    const isStyling =
        className && /^language-style/.test(className.toLocaleLowerCase());

    const code = children
        ? getCodeString(props.node.children)
        : children[0] || "";

    React.useEffect(() => {
        if (container && isMermaid && demoid.current && code) {
            mermaid
                .initialize({
                    securityLevel: "loose",
                    maxEdges: 30000,
                    secure: ['secure', 'securityLevel', 'startOnLoad', 'maxTextSize', 'suppressErrorRendering'],
                });
            mermaid
                .render(demoid.current, code)
                .then(({ svg, bindFunctions }) => {
                    // eslint-disable-next-line powerbi-visuals/no-inner-outer-html
                    container.innerHTML = svg;
                    if (bindFunctions) {
                        bindFunctions(container);
                    }
                })
                .catch((error) => {
                    console.log("error:", error);
                    // eslint-disable-next-line powerbi-visuals/no-inner-outer-html
                    container.textContent = code;
                });
        }
    }, [container, isMermaid, code, demoid]);

    const refElement = React.useCallback((node) => {
        if (node !== null) {
            setContainer(node);
        }
    }, []);

    if (isMermaid) {
        return (
            <React.Fragment>
                <ErrorBoundary>
                    <code id={demoid.current} style={{ display: "none" }} />
                    <code className={className + " mermaid"} ref={refElement} data-name="mermaid" />
                </ErrorBoundary>
            </React.Fragment>
        );
    }
    if (isStyling) {
        if (code.trim() == "") {
            return null;
        }
        return (
            <ErrorBoundary>
                <React.Fragment>
                    <style dangerouslySetInnerHTML={{
                        __html: code
                    }} className={className + " style"} data-name="style" >
                    </style>
                </React.Fragment>
            </ErrorBoundary>
        )
    }
    return (<ErrorBoundary>
        <code className={className}>{children.toString()}</code>
    </ErrorBoundary>);
};

export function Editor({
    onChange,
    onSaveResources,
    height,
    table,
    onBackgroundClick,
    onBackgroundContextMenu,
    launchUrl,
    value: currentValue,
    width,
    resources
}: EditorProps) {
    const [value, setValue] = React.useState(null);

    React.useEffect(() => {
        if (value == null) {
            setValue(currentValue);
        }
    }, [currentValue, setValue, value]);

    const template = React.useMemo(() => {
        return Handlebars.compile(value ?? "");
    }, [value]);

    const hbout = React.useMemo(() => {
        try {
            return template({
                table: table,
                viewport: {
                    width: width,
                    height: height
                }
            })
        } catch (err) {
            return `\n\n${err.message}\n\n${err.stack}\n\n`;
        }
    }, [template]);

    const saveButton = React.useMemo(() => {
        return {
            name: "save",
            keyCommand: "save",
            buttonProps: { "aria-label": "Save" },
            icon: (
                <svg viewBox="0 0 32 16" width="24px" height="12px">
                    <text color="currentColor" x="0" y="12">
                        Save
                    </text>
                </svg>
            ),
            execute: (state, api) => {
                onChange(value);
            }
        };
    }, [onChange, value]);

    const docsButton = React.useMemo(() => {
        return {
            name: "docs",
            keyCommand: "docs",
            buttonProps: { "aria-label": "Save" },
            icon: (
                <svg viewBox="0 0 16 16" width="12px" height="12px">
                    <g transform="translate(0,0) scale(0.13)">
                        <path d="M12.64,77.27l0.31-54.92h-6.2v69.88c8.52-2.2,17.07-3.6,25.68-3.66c7.95-0.05,15.9,1.06,23.87,3.76 c-4.95-4.01-10.47-6.96-16.36-8.88c-7.42-2.42-15.44-3.22-23.66-2.52c-1.86,0.15-3.48-1.23-3.64-3.08 C12.62,77.65,12.62,77.46,12.64,77.27L12.64,77.27z M103.62,19.48c-0.02-0.16-0.04-0.33-0.04-0.51c0-0.17,0.01-0.34,0.04-0.51V7.34 c-7.8-0.74-15.84,0.12-22.86,2.78c-6.56,2.49-12.22,6.58-15.9,12.44V85.9c5.72-3.82,11.57-6.96,17.58-9.1 c6.85-2.44,13.89-3.6,21.18-3.02V19.48L103.62,19.48z M110.37,15.6h9.14c1.86,0,3.37,1.51,3.37,3.37v77.66 c0,1.86-1.51,3.37-3.37,3.37c-0.38,0-0.75-0.06-1.09-0.18c-9.4-2.69-18.74-4.48-27.99-4.54c-9.02-0.06-18.03,1.53-27.08,5.52 c-0.56,0.37-1.23,0.57-1.92,0.56c-0.68,0.01-1.35-0.19-1.92-0.56c-9.04-4-18.06-5.58-27.08-5.52c-9.25,0.06-18.58,1.85-27.99,4.54 c-0.34,0.12-0.71,0.18-1.09,0.18C1.51,100.01,0,98.5,0,96.64V18.97c0-1.86,1.51-3.37,3.37-3.37h9.61l0.06-11.26 c0.01-1.62,1.15-2.96,2.68-3.28l0,0c8.87-1.85,19.65-1.39,29.1,2.23c6.53,2.5,12.46,6.49,16.79,12.25 c4.37-5.37,10.21-9.23,16.78-11.72c8.98-3.41,19.34-4.23,29.09-2.8c1.68,0.24,2.88,1.69,2.88,3.33h0V15.6L110.37,15.6z M68.13,91.82c7.45-2.34,14.89-3.3,22.33-3.26c8.61,0.05,17.16,1.46,25.68,3.66V22.35h-5.77v55.22c0,1.86-1.51,3.37-3.37,3.37 c-0.27,0-0.53-0.03-0.78-0.09c-7.38-1.16-14.53-0.2-21.51,2.29C79.09,85.15,73.57,88.15,68.13,91.82L68.13,91.82z M58.12,85.25 V22.46c-3.53-6.23-9.24-10.4-15.69-12.87c-7.31-2.8-15.52-3.43-22.68-2.41l-0.38,66.81c7.81-0.28,15.45,0.71,22.64,3.06 C47.73,78.91,53.15,81.64,58.12,85.25L58.12,85.25z"/>
                    </g>
                </svg>
            ),
            execute: (state, api) => {
                launchUrl("https://ilfat-galiev.im/docs/markdown-visual/");
            }
        };
    }, [onChange, value]);

    return (
        <>
            <Tabs
                className="tabs-header"
                defaultActiveKey="1"
                items={[
                    {
                        key: '1',
                        label: 'Editor',
                        children: (<>
                            <div className="container" data-color-mode="light">
                                <MDEditor
                                    height={height}
                                    value={value}
                                    onChange={(value) => {
                                        setValue(value);
                                    }}
                                    components={{
                                        preview: (source, state, dispath) => {
                                            return (
                                                <div
                                                    onClick={onBackgroundClick}
                                                    onContextMenu={onBackgroundContextMenu}
                                                >
                                                    <ErrorBoundary>
                                                        <MDEditor.Markdown
                                                            components={{
                                                                code: Code
                                                            }}
                                                            rehypePlugins={[[rehypeSanitize]]}
                                                            source={hbout}
                                                            urlTransform={(url) => {
                                                                const res = resources.find(r => r.name === url);
                                                                if (res) {
                                                                    return res.value as string;
                                                                }
                                                                return url;
                                                            }}
                                                        />
                                                    </ErrorBoundary>
                                                </div>
                                            )
                                        }
                                    }}
                                    commands={[saveButton, ...commands.getCommands(), docsButton]}
                                    highlightEnable={false}
                                />
                            </div>
                        </>)
                    },
                    {
                        key: '2',
                        label: 'Resources',
                        children: (<>
                            <Resources onSaveResources={onSaveResources} height={height} resources={resources} width={width} />
                        </>)
                    }
                ]}
            />
        </>

    );
}