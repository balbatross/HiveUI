import React, { useState } from "react";
import { Box } from "@mui/material";
import RGL, { Responsive, WidthProvider } from "react-grid-layout";
import { GraphContainer } from "./GraphContainer";

import styled from "styled-components";

// import "react-grid-layout/css/styles.css";
// import "react-resizable/css/styles.css";

// const ReactGridLayout = WidthProvider(RGL);
const ResponsiveGridLayout = WidthProvider(Responsive);

export interface GridLayout {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface GridLayoutItem {
  id: string;
  label?: string;
  total?: string;
  extras?: any;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface GraphGridProps {
  className?: string;
  onRemoveItem?: (item: GridLayoutItem) => void;
  onLayoutChange: (layout: GridLayout[]) => void;
  layout: GridLayoutItem[];
  children: (item: GridLayoutItem) => React.ReactNode;
  noWrap?: boolean;

  rowHeight?: number;
  cols?: {
    [key: string]: number;
  };
  breakpoints?: {
    [key: string]: number;
  };
}

export const BaseGraphGrid: React.FC<GraphGridProps> = (props) => {
  const [layouts, setLayouts] = useState(null);
  const [widgetArray, setWidgetArray] = useState([]);

  //   const handleModify = (layouts, layout) => {
  //     const tempArray = widgetArray;
  //     setLayouts(layout);
  //     layouts?.map((position) => {
  //       tempArray[Number(position.i)].x = position.x;
  //       tempArray[Number(position.i)].y = position.y;
  //       tempArray[Number(position.i)].width = position.w;
  //       tempArray[Number(position.i)].height = position.h;
  //     });
  //     setWidgetArray(tempArray);
  //   };

  return (
    <Box sx={{display: 'flex'}} className={props.className}>
      {/* {props.children} */}
      <ResponsiveGridLayout
        
        rowHeight={props.rowHeight || 30}
        layouts={{ lg: props.layout.map((x) => ({ ...x, i: x.id })) }}
        onLayoutChange={props.onLayoutChange}
        cols={props.cols || { lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
        breakpoints={
          props.breakpoints || { lg: 1200, md: 996, sm: 768, xs: 480, xxs: 0 }
        }
        className="rgl"
      >
        {props.layout.map((item) => (
          <div style={{ display: "flex" }} key={item.id}>
            {props.noWrap ? (
              props.children(item)
            ) : (
              <GraphContainer
                dataKey={item.id}
                label={item.label}
                total={item.total}
                onRemove={() => props.onRemoveItem?.(item)}
              >
                {props.children?.(item)}
              </GraphContainer>
            )}
          </div>
        ))}
      </ResponsiveGridLayout>
    </Box>
  ); //<div>{props.children}</div>;
};

export const GraphGrid = styled(BaseGraphGrid)`
  .react-grid-layout {
    position: relative;
    transition: height 200ms ease;
  }
  .react-grid-item {
    transition: all 200ms ease;
    transition-property: left, top;
  }
  .react-grid-item img {
    pointer-events: none;
    user-select: none;
  }
  .react-grid-item.cssTransforms {
    transition-property: transform;
  }
  .react-grid-item.resizing {
    z-index: 1;
    will-change: width, height;
  }

  .react-grid-item.react-draggable-dragging {
    transition: none;
    z-index: 3;
    will-change: transform;
  }

  .react-grid-item.dropping {
    visibility: hidden;
  }

  .react-grid-item.react-grid-placeholder {
    background: red;
    opacity: 0.2;
    transition-duration: 100ms;
    z-index: 2;
    -webkit-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    -o-user-select: none;
    user-select: none;
  }

  .react-grid-item > .react-resizable-handle {
    position: absolute;
    width: 20px;
    height: 20px;
  }

  .react-grid-item > .react-resizable-handle::after {
    content: "";
    position: absolute;
    right: 3px;
    bottom: 3px;
    width: 5px;
    height: 5px;
    border-right: 2px solid rgba(0, 0, 0, 0.4);
    border-bottom: 2px solid rgba(0, 0, 0, 0.4);
  }

  .react-resizable-hide > .react-resizable-handle {
    display: none;
  }

  .react-grid-item > .react-resizable-handle.react-resizable-handle-sw {
    bottom: 0;
    left: 0;
    cursor: sw-resize;
    transform: rotate(90deg);
  }
  .react-grid-item > .react-resizable-handle.react-resizable-handle-se {
    bottom: 0;
    right: 0;
    cursor: se-resize;
  }
  .react-grid-item > .react-resizable-handle.react-resizable-handle-nw {
    top: 0;
    left: 0;
    cursor: nw-resize;
    transform: rotate(180deg);
  }
  .react-grid-item > .react-resizable-handle.react-resizable-handle-ne {
    top: 0;
    right: 0;
    cursor: ne-resize;
    transform: rotate(270deg);
  }
  .react-grid-item > .react-resizable-handle.react-resizable-handle-w,
  .react-grid-item > .react-resizable-handle.react-resizable-handle-e {
    top: 50%;
    margin-top: -10px;
    cursor: ew-resize;
  }
  .react-grid-item > .react-resizable-handle.react-resizable-handle-w {
    left: 0;
    transform: rotate(135deg);
  }
  .react-grid-item > .react-resizable-handle.react-resizable-handle-e {
    right: 0;
    transform: rotate(315deg);
  }
  .react-grid-item > .react-resizable-handle.react-resizable-handle-n,
  .react-grid-item > .react-resizable-handle.react-resizable-handle-s {
    left: 50%;
    margin-left: -10px;
    cursor: ns-resize;
  }
  .react-grid-item > .react-resizable-handle.react-resizable-handle-n {
    top: 0;
    transform: rotate(225deg);
  }
  .react-grid-item > .react-resizable-handle.react-resizable-handle-s {
    bottom: 0;
    transform: rotate(45deg);
  }

  .react-resizable {
    position: relative;
  }
  .react-resizable-handle {
    position: absolute;
    width: 20px;
    height: 20px;
    background-repeat: no-repeat;
    background-origin: content-box;
    box-sizing: border-box;
    background-image: url("data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2IDYiIHN0eWxlPSJiYWNrZ3JvdW5kLWNvbG9yOiNmZmZmZmYwMCIgeD0iMHB4IiB5PSIwcHgiIHdpZHRoPSI2cHgiIGhlaWdodD0iNnB4Ij48ZyBvcGFjaXR5PSIwLjMwMiI+PHBhdGggZD0iTSA2IDYgTCAwIDYgTCAwIDQuMiBMIDQgNC4yIEwgNC4yIDQuMiBMIDQuMiAwIEwgNiAwIEwgNiA2IEwgNiA2IFoiIGZpbGw9IiMwMDAwMDAiLz48L2c+PC9zdmc+");
    background-position: bottom right;
    padding: 0 3px 3px 0;
  }
  .react-resizable-handle-sw {
    bottom: 0;
    left: 0;
    cursor: sw-resize;
    transform: rotate(90deg);
  }
  .react-resizable-handle-se {
    bottom: 0;
    right: 0;
    cursor: se-resize;
  }
  .react-resizable-handle-nw {
    top: 0;
    left: 0;
    cursor: nw-resize;
    transform: rotate(180deg);
  }
  .react-resizable-handle-ne {
    top: 0;
    right: 0;
    cursor: ne-resize;
    transform: rotate(270deg);
  }
  .react-resizable-handle-w,
  .react-resizable-handle-e {
    top: 50%;
    margin-top: -10px;
    cursor: ew-resize;
  }
  .react-resizable-handle-w {
    left: 0;
    transform: rotate(135deg);
  }
  .react-resizable-handle-e {
    right: 0;
    transform: rotate(315deg);
  }
  .react-resizable-handle-n,
  .react-resizable-handle-s {
    left: 50%;
    margin-left: -10px;
    cursor: ns-resize;
  }
  .react-resizable-handle-n {
    top: 0;
    transform: rotate(225deg);
  }
  .react-resizable-handle-s {
    bottom: 0;
    transform: rotate(45deg);
  }
`;
