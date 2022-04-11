/* eslint-disable no-unused-vars */
import React, { Children, cloneElement, isValidElement } from "react";
import { connectField } from "uniforms";

import ListItemField from "./ListItemField";

function List({
  children = <ListItemField name="$" />,
  className,
  disabled,
  error,
  errorMessage,
  initialCount,
  itemProps,
  label,
  name,
  required,
  showInlineError,
  value,
  ...props
}) {
  return value?.map((item, itemIndex) =>
    Children.map(children, (child, childIndex) =>
      isValidElement(child)
        ? cloneElement(child, {
            key: `${itemIndex}-${childIndex}`,
            name: child.props.name?.replace("$", `${itemIndex}`),
            ...itemProps
          })
        : child
    )
  );
}

export default connectField(List);
