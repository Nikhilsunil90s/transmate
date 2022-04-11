import React, { useState } from "react";
import { func, bool } from "prop-types";
import { Checkbox } from "semantic-ui-react";

const CheckBox = ({ onCheckChanged, checked, ...props }) => {
  const [isChecked, setChecked] = useState(checked || false);

  const handleCheckChange = () => {
    const newCheckState = !isChecked;
    setChecked(newCheckState);

    const checkChangeListener = onCheckChanged;
    if (checkChangeListener) {
      checkChangeListener(newCheckState);
    }
  };

  return <Checkbox {...props} onChange={handleCheckChange} checked={isChecked} />;
};

CheckBox.propTypes = {
  onCheckChanged: func,
  checked: bool
};

export default CheckBox;
