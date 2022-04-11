import React from "react";
import { useTranslation } from "react-i18next";
import { Icon, Popup } from "semantic-ui-react";
import { oneOf } from "prop-types";
import { MODES_ICONS, ALL_MODES } from "/imports/api/_jsonSchemas/enums/modes";

const ModeTag = ({ mode }) => {
  const { t } = useTranslation();
  const icon = MODES_ICONS[mode] || "truck";
  const tMode = mode || "road";

  return <Popup content={t(`general.modes.${tMode}`)} trigger={<Icon name={icon} />} />;
};

ModeTag.propTypes = {
  mode: oneOf(ALL_MODES)
};

export default ModeTag;
