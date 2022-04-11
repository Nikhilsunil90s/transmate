import cloneDeep from "lodash/cloneDeep";
import React from "react";
import { connectField, filterDOMProps, joinName, useField } from "uniforms";
import { Button } from "semantic-ui-react";

function ListAdd({ disabled, name, value, label, ...props }) {
  const nameParts = joinName(null, name);
  const parentName = joinName(nameParts.slice(0, -1));
  const [parent] = useField(parentName, {}, { absoluteName: true });

  const limitNotReached = !disabled && !(parent.maxCount <= parent.value?.length);

  return (
    <Button
      {...filterDOMProps(props)}
      type="button"
      basic
      content={label}
      onClick={() => {
        if (limitNotReached) {
          const newValue = (parent.value || []).concat([cloneDeep(value)]);
          parent.onChange(newValue);
        }
      }}
    />
  );
}

export default connectField(ListAdd, { initialValue: false });
