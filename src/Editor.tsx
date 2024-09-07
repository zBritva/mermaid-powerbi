/* eslint-disable @typescript-eslint/no-unused-vars */
import React from "react";
import MDEditor, { commands } from '@uiw/react-md-editor/nohighlight';
import rehypeSanitize from "rehype-sanitize";
import { getCodeString } from 'rehype-rewrite';
import { Table } from "./utils";
import Handlebars from "handlebars";

import * as mermaid from "mermaid";

import { ErrorBoundary } from "./Error";

export interface EditorProps {
    value: string;
    onChange: (value: string, event?: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
    onBackgroundClick: (e: React.MouseEvent<HTMLElement>) => void;
    onBackgroundContextMenu: (e: React.MouseEvent) => void;
    height: number;
    width: number;
    table: Table;
}

// eslint-disable-next-line powerbi-visuals/insecure-random
const randomid = () => parseInt(String(Math.random() * 1e15), 10).toString(36);

export const Code = (props) => {
    const children = props?.children || [];
    const className = props?.className;
    const demoid = React.useRef(`dome${randomid()}`);
    const [container, setContainer] = React.useState(null);
    const isMermaid =
        className && /^language-mermaid/.test(className.toLocaleLowerCase());
    
    const code = children
        ? getCodeString(props.node.children)
        : children[0] || "";

    React.useEffect(() => {
        if (container && isMermaid && demoid.current && code) {
            mermaid.default
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
                <code id={demoid.current} style={{ display: "none" }} />
                <code className={className + " mermaid"} ref={refElement} data-name="mermaid" />
            </React.Fragment>
        );
    }
    return <code className={className}>{children}</code>;
};

export function Editor(props: EditorProps) {
    const [value, setValue] = React.useState(null);

    React.useEffect(() => {
        if (value == null) {
            setValue(props.value);
        }
    }, [props.value, setValue, value]);

    const template = React.useMemo(() => {
        return Handlebars.compile(value ?? "");
    }, [value]);

    const hbout = React.useMemo(() => {
        try {
            return template({
                table: props.table,
                viewport: {
                    width: props.width,
                    height: props.height
                }
            })
        } catch (err) {
            return `\n\n${err.message}\n\n${err.stack}\n\n`;
        }
    }, [template]);

    const save = {
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
            props.onChange(value);
        }
    };

    return (
        <>
            <div className="container" data-color-mode="light">
                <MDEditor
                    height={props.height}
                    value={value}
                    onChange={(value) => {
                        setValue(value);
                    }}
                    components={{
                        preview: (source, state, dispath) => {
                            return (
                                <div
                                    onClick={props.onBackgroundClick}
                                    onContextMenu={props.onBackgroundContextMenu}
                                >
                                    <ErrorBoundary>
                                        <MDEditor.Markdown
                                            components={{
                                                code: Code
                                            }}
                                            rehypePlugins={[[rehypeSanitize]]}
                                            source={hbout}
                                            urlTransform={(url) => {
                                                return url;
                                            }}
                                        />
                                    </ErrorBoundary>
                                </div>
                            )
                        }
                        
                    }}
                    commands={[save, ...commands.getCommands()]}
                    highlightEnable={false}
                />
            </div>
        </>

    );
}