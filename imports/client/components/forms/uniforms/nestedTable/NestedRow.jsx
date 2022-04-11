/* eslint-disable no-unused-vars */
import React, { Children } from "react";
import { connectField, joinName } from "uniforms";
import { AutoField } from "uniforms-semantic";

import { Table } from "semantic-ui-react";

const Nest = ({
  children,
  className,
  disabled,
  error,
  errorMessage,
  fields,
  grouped,
  itemProps,
  label,
  name,
  showInlineError,
  ...props
}) => {
  return children ? (
    <>
      {/* {injectName(name, children).map((el, i) => (
        <Table.Cell key={i}>{el}</Table.Cell>
      ))} */}

      {Children.map(children, child => {
        const el = React.cloneElement(child);

        // debug("--------", child.props.name, cprops);
        return <Table.Cell>{el}</Table.Cell>;
      })}
    </>
  ) : (
    fields.map(key => (
      <Table.Cell key={key}>
        <AutoField key={key} name={joinName(name, key)} {...itemProps} />
      </Table.Cell>
    ))
  );
};

Nest.defaultProps = { grouped: true };

export default connectField(Nest, {
  ensureValue: false,
  includeInChain: false
});
