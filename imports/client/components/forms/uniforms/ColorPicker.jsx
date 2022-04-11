import React, { useState } from "react";
import classNames from "classnames";
import { connectField } from "uniforms";
import { Input } from "semantic-ui-react";
import { ChromePicker } from "react-color";

const DEFAULT_COLOR = "#fff";

const ColorPicker = ({ disabled, id, inputRef, label, onChange, error, required, value }) => {
  const [showColorPicker, setVisible] = useState(false);
  const handleChangeComplete = color => {
    onChange(color?.hex);
    setVisible(false);
  };

  const setVisibility = () => {
    if (disabled) return;
    setVisible(!showColorPicker);
  };

  return (
    <div className={classNames("field", { required, error })}>
      <label htmlFor={id}>{label}</label>
      <Input disabled={disabled} value={value} onClick={setVisibility} />
      {showColorPicker ? (
        <ChromePicker
          inputRef={inputRef}
          id={id}
          color={value || DEFAULT_COLOR}
          onChangeComplete={handleChangeComplete}
        />
      ) : null}
    </div>
  );
};

export default connectField(ColorPicker);
