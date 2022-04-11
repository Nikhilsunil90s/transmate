import React from "react";
import { useTranslation } from "react-i18next";
import { connectField } from "uniforms";
import { ALL_MODES, MODES_ICONS } from "/imports/api/_jsonSchemas/enums/modes";
import PropTypes from "prop-types";

import { Icon } from "semantic-ui-react";
import { SelectField } from "./SelectField";

export const DropdownModes = ({ ...props }) => {
  const { t } = useTranslation();
  const options = ALL_MODES.map(mode => ({
    value: mode,
    text: (
      <>
        <Icon name={MODES_ICONS[mode]} />
        {t(`general.modes.${mode}`)}
      </>
    )
  }));

  return <SelectField {...props} options={options} />;
};

DropdownModes.propTypes = {
  label: PropTypes.oneOfType([PropTypes.string, PropTypes.element]),
  name: PropTypes.string,
  value: PropTypes.string,
  disabled: PropTypes.bool,
  onChange: PropTypes.func.isRequired
};

export default connectField(DropdownModes);
