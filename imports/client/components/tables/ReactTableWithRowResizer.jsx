import React, { useState, createRef, useEffect } from "react";

import ReactTable from "./ReactTable";
import useWindowDimensions from "../../utils/hooks/useWindowDimensions";
import { calculateRowHeights } from "./utils/calculateRowHeights";

const ReactTableWithRowResizer = props => {
  const tableContainerRef = createRef();

  const { height: windowHeight } = useWindowDimensions();

  const [containerSize, setContainerSize] = useState({ height: 0, width: 0 });
  useEffect(() => {
    const tableContainerSize = tableContainerRef.current.getBoundingClientRect();
    setContainerSize(tableContainerSize);
  }, [windowHeight]);

  // Currently we only assume some default-heights for rows and columns in function `calculateRowHeights`
  // todo calculate numberOfHeaders from checking the max nested level from props.column.headers
  // todo calculate headerHeight from ref tracing
  // todo calculate rowHeight from ref tracing
  const { maxRows, windowEvaluation } = calculateRowHeights({
    containerHeight: containerSize.height
  });

  return (
    <div style={{ width: "100%", height: "100%" }} ref={tableContainerRef}>
      <ReactTable maxRows={maxRows} windowEvaluation={windowEvaluation} {...props} />
    </div>
  );
};

export default ReactTableWithRowResizer;
