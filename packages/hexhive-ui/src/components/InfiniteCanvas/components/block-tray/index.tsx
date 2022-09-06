import React from 'react';
import { TrayItem } from './tray-item';
import styled from 'styled-components';
import { Block } from '../../InfiniteCanvas';
import { Typography } from '@mui/material';


export interface BlockTrayProps {
    blocks: Block[]
    groupBy?: string;
    className?: string;
    renderHeader?: (header: string) => JSX.Element;
    renderItem?: (block: Block, ix: number) => JSX.Element;
}

export const BaseBlockTray : React.FC<BlockTrayProps> = (props) => {
    
    const renderGrouped = () => {
        let groupBy = props.groupBy || ''

        const groups = (props.blocks as any[]).reduce((prev, curr) => {
            if(!prev[curr[groupBy]]) prev[curr[groupBy]] = [];
            prev[curr[groupBy]].push(curr)
            return prev;
        }, {})

        let items = [];
        for(var k in groups){
            items.push(
                <>
                    {props.renderHeader ? props.renderHeader(k) : <Typography>{k}</Typography>}
                    {groups[k].map((block: any, ix: number) => (
                        <TrayItem model={block}>
                            {props.renderItem ? props.renderItem(block, ix) : block.label}
                        </TrayItem>
                    ))}
                    {/* <List 
                        data={groups[k]} >
                        {(datum: any, ix: number) => (
                            <TrayItem model={datum}>
                                {props.renderItem ? props.renderItem(datum, ix) : datum.label}
                            </TrayItem>
                        )}
                    </List> */}
                </>
            )
        }
        return items;
    }
    const renderList = () => {
        return props.blocks.map((block, ix) => (
            <TrayItem model={block}>
                {props.renderItem ? props.renderItem(block, ix) : block.label}
            </TrayItem>
        ))
    }

    return (
        <div className={props.className}>
            {props.groupBy ? renderGrouped() : renderList()}
        </div>
    )
}

export const BlockTray = styled(BaseBlockTray)`
    .tray-item{
        margin-top: 4px;
        user-select: none;
    }
`