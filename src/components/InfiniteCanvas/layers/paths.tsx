import React, { useContext, useEffect, useMemo, useState } from 'react';
import styled from 'styled-components'
import { bfs_search, createLine, getHostForElement } from '../utils';
import { HMILink } from '../assets/hmi-spec';
import { InfiniteCanvasContext } from '../context/context';
import { InfiniteCanvasPath, InfiniteCanvasPosition } from '../types/canvas';
import { FlowPath } from '../defaults/path';
import { Box } from 'grommet';

export interface PathLayerProps {
}


export const PathLayer : React.FC<PathLayerProps> = (props) => {
    const { 
        zoom, 
        offset, 
        nodes,
        paths:_paths,
        ports,
        updatePathPoint, 
        linkPath, 
        selectPath,
        addPathPoint,
        openContextMenu,
        selected,
        editable,
        style
    } = useContext(InfiniteCanvasContext)


    // const [ paths, setPaths ] = useState<InfiniteCanvasPath[]>([])
    


    const paths = useMemo(() => {
        if(_paths && nodes && ports){
            
            let p = _paths.map((x) => {
                let points = x.points || [];
            
                if(x.sourceHandle){
                    let node = nodes?.find((a) => a.id == x.source)
                    let port = ports?.[`${x.source}:${x.sourceHandle}`]

                    if(port && node){

                        
                        let point = {
                            x: (node?.x || 0) + (port?.relativeX || 0) + ((port.width || 0) / 2),
                            y: (node?.y || 0) + (port?.relativeY || 0) + ((port.height || 0) /2)
                        }
                        points = [point, ...(points || [])]
                    }
                 }

                if(x.targetHandle){
                    let node = nodes?.find((a) => a.id == x.target)
                    let port = ports?.[`${x.target}:${x.targetHandle}`]

                    if(port && node){
                        let point = {
                            x: (node?.x || 0)+ (port?.relativeX || 0) + ((port.width || 0) / 2),
                            y: (node?.y || 0) +(port?.relativeY || 0)+ ((port.height || 0) /2)
                        }
                        points = [...(points || []), point]
                    }
                }
                return {
                    ...x,
                    points: points,
                    id: x.id,
                    
                }
            })

            // setPaths(p)
            return p
        }
        return []
    }, [_paths, nodes, ports])


   

    const addPoint = (path_id: string, ix: number, e: React.MouseEvent, pos: InfiniteCanvasPosition) => {
        addPathPoint?.(path_id, ix, pos)
        e.stopPropagation()

        console.log(e)

        let doc = getHostForElement(e.target as HTMLElement)

        const mouseMove = (e: MouseEvent) => {
            updatePoint(path_id, ix + 1, {
                x: e.clientX,
                y: e.clientY
            })
        }

        const mouseUp = (e: MouseEvent) => {    
            doc.removeEventListener('mousemove', mouseMove as EventListenerOrEventListenerObject)
            doc.removeEventListener('mouseup', mouseUp as EventListenerOrEventListenerObject)
        }

        doc.addEventListener('mousemove', mouseMove as EventListenerOrEventListenerObject)
        doc.addEventListener('mouseup', mouseUp as EventListenerOrEventListenerObject)
    }

    const updatePoint = (path_id: string, ix: number, pos: InfiniteCanvasPosition) => {
        updatePathPoint?.(path_id, ix - 1, pos)
    }


    const onSelect = (path_id: string) => {
        selectPath?.(path_id)
    }

    return (
        <svg
            style={{
                width: '100%',
                height: '100%',
                overflow: 'visible',
                pointerEvents: 'all',
                transformOrigin: '0 0',
                transform: `matrix(${zoom}, 0, 0, ${zoom}, ${offset.x}, ${offset.y})`,
                position: 'absolute'
            }}>
                {paths?.map((path) => 
                (
                    <>
                    {/* {context.selected?.type == 'path' && context.selected.id == path.id && path.menu && (
                        <Box 
                            onMouseDown={(e) => e.stopPropagation()}
                            flex
                            round="xsmall"
                            className="menu-dialog" 
                            style={{position: 'absolute', left: '100%', minHeight: 50}} background="light-1">
                            <Box
                                gap="xsmall"
                                pad="xsmall">
                                {path.menu}
                            </Box>
                        </Box>
                    )} */}
                          <FlowPath
                            onContextMenu={(e) => openContextMenu?.({x: e.clientX, y: e.clientY}, {type: "path", id: path.id})}
                            selected={selected?.find((a) => a.key == 'path' && a.id == path.id) != null}
                            path={path}
                            editable={editable}
                            onLinked={(nodeId, handleId) => linkPath?.(path.id, nodeId, handleId)}
                            onPointsChanged={(ix, point) => {
                                updatePoint(path.id, ix, point)
                                console.log("UPDATED POINT", {ix, point})
                            }}
                            onMouseDown={(ix, e, position) => (e.metaKey || e.ctrlKey) ? addPoint(path.id, ix, e, position) : onSelect(path.id)}
                            points={(path.points || [])} />
                    </>
                )
                )}
        </svg>
    )
}

//                            className={getStatus(path.id) ? "active" : 'inactive'} 
