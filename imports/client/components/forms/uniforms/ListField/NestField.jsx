import classnames from "classnames";
import React from "react";
import { connectField, filterDOMProps } from "uniforms";

import { AutoField } from "uniforms-semantic";

function Nest({
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
}) {
  return (
    <div
      className={classnames(className, { disabled, error, grouped }, "fields")}
      {...filterDOMProps(props)}
    >
      {label && (
        <div className="field">
          <label>{label}</label>
        </div>
      )}

      {!!(error && showInlineError) && <div className="ui red basic label">{errorMessage}</div>}

      {children || fields?.map(field => <AutoField key={field} name={field} {...itemProps} />)}
    </div>
  );
}

Nest.defaultProps = { grouped: true };

export default connectField(Nest);
