/* eslint-disable @typescript-eslint/no-unused-vars */
import { Button, Flex, Input, Table } from "antd";
import React, { useCallback, useRef, useState } from "react";

import { LoadDataFromFile, replaceResourceName } from "./utils/base64loader"

import { PlusOutlined } from '@ant-design/icons';

export interface ResourcesProps {
    resources: Resource[];
    width: number;
    height: number;
    onSaveResources: (resources: Resource[]) => void
}

export interface Resource {
    size: string,
    name: string,
    value: string | ArrayBuffer | null
}

export const Resources: React.FC<ResourcesProps> = ({
    resources,
    height,
    onSaveResources
}) => {
    // const host = useAppSelector((state) => state.options.host);
    const [resourceName, setResourceName] = useState<string>('');

    const [resourcesList, setResourcesList] = useState<Resource[]>(resources);

    const onRemoveResource = useCallback((index: number) => {
        resourcesList.splice(index, 1);
        setResourcesList([...resourcesList]);
    }, [resourcesList, setResourcesList]);

    const onSave = React.useCallback(() => {
        onSaveResources(resourcesList)
    }, [onSaveResources]);

    const fileInput = useRef<HTMLInputElement>(null);
    return (
        <>
            <Flex vertical={true}>
                <div
                    style={{
                        width: "100%",
                        height: `${height * (9 / 10)}px`
                    }}
                >
                    <Flex vertical={false} className="resource-loader">
                        <Button onClick={onSave} >Save resources</Button>
                        <input ref={fileInput} type="file" style={{ display: 'none' }} onChange={async () => {
                            const data = await LoadDataFromFile(fileInput.current);
                            if (!data) return;
                            const resource = {
                                size: `${Math.round(fileInput.current.files[0].size / 1024)}kb`,
                                name: replaceResourceName(resourceName || fileInput.current.files[0].name),
                                value: data
                            };
                            resourcesList.push(resource);
                            setResourcesList([...resourcesList]);
                        }} />
                        <Input value={resourceName} placeholder="Resource name" width={300} onChange={(value) => {
                            setResourceName(value.target.value);
                        }} />
                        <Button onClick={() => fileInput.current.click()} className="resource-loader-button" type="primary" icon={<PlusOutlined />} />
                    </Flex>
                    <Table dataSource={resourcesList} columns={[
                        {
                            title: 'Resource name',
                            dataIndex: 'name',
                            key: 'name',
                            render: (value: any, record: any, index: number) => <p className="user-select-all">{value}</p>
                        },
                        {
                            title: 'Size',
                            dataIndex: 'size',
                            key: 'size',
                        },
                        {
                            title: 'Action',
                            dataIndex: '',
                            key: 'remove',
                            render: (value: any, record: any, index: number) => <Button onClick={() => onRemoveResource(index)}>Delete</Button>,
                        }
                    ]} />
                </div>
            </Flex>

        </>
    )
}




