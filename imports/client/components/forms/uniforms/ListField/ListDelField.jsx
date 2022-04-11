import classnames from "classnames";
import React from "react";
import { connectField, filterDOMProps, joinName, useField } from "uniforms";

function ListDel({ disabled, name, ...props }) {
  const nameParts = joinName(null, name);
  const nameIndex = +nameParts[nameParts.length - 1];
  const parentName = joinName(nameParts.slice(0, -1));
  const parent = useField(parentName, {}, { absoluteName: true })[0];

  const limitNotReached = !disabled && !(parent.minCount >= parent.value.length);

  return limitNotReached ? (
    <i
      {...filterDOMProps(props)}
      className={classnames("ui", props.className, "link", "trash alternate icon")}
      style={{ cursor: "pointer" }}
      onClick={() => {
        if (limitNotReached) {
          const value = parent.value.slice();
          value.splice(nameIndex, 1);
          parent.onChange(value);
        }
      }}
    />
  ) : null;
}

export default connectField(ListDel, { initialValue: false, kind: "leaf" });
