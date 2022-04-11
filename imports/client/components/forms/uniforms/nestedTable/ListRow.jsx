/* eslint-disable no-unused-vars */
/* eslint-disable no-shadow */
import React, { Children, cloneElement, isValidElement } from "react";
import { connectField } from "uniforms";

import ListRowItemField from "./ListRowItem";

function List({
  children = <ListRowItemField name="$" />,
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
  return value
    ? value.map((item, itemIndex) =>
        Children.map(children, (child, childIndex) =>
          isValidElement(child)
            ? cloneElement(child, {
                key: `${itemIndex}-${childIndex}`,
                name: child.props.name?.replace("$", `${itemIndex}`),
                ...itemProps
              })
            : child
        )
      )
    : null;
}

export default connectField(List);

/*
const ListFields = ({
  children,
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
}) =>
  children
    ? value.map((item, index) =>
        Children.map(children, child => {
          return React.cloneElement(child, {
            // value: item,
            key: index,
            label: null,
            name: joinName(name, child.props.name && child.props.name.replace("$", index))
          });
        })
      )
    : value.map((item, index) => {
        return (
          <ListRowItemField
            value={item}
            key={index}
            label={null}
            name={joinName(name, index)}
            {...itemProps}
          />
        );
      });

export default connectField(ListFields, {
  ensureValue: false,
  includeInChain: false
});
*/
