import React, { forwardRef, useImperativeHandle, useState, useEffect } from "react";
import { Checkbox } from "semantic-ui-react";

let refContainer;
export default forwardRef((props, ref) => {
  // props.api.getDisplayedRowAtIndex(props.rowIndex).data // whole row data
  // props.value = cell value

  const [data, setData] = useState(props.value);
  const [editing] = useState(true); // TODO: set the state??
  const toggle = () => setData(!data);

  const focus = () => {
    window.setTimeout(() => {
      if (refContainer.current) {
        refContainer.current.focus();
      }
    });
  };

  useEffect(() => {
    focus();
  }, []);

  useImperativeHandle(ref, () => {
    return {
      getReactContainerClasses() {
        return ["custom-tooltip"];
      }
    };
  });

  useEffect(() => {
    if (!editing) {
      props.api.stopEditing();
    }
  }, [editing]);

  return (
    <div ref={refContainer}>
      <Checkbox toggle checked={data} onChange={toggle} />
    </div>
  );
});
