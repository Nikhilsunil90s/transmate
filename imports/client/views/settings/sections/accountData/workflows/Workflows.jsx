import React from "react";
import { IconSegment } from "/imports/client/components/utilities/IconSegment";
import AccountUpgradeBlock from "../../../components/Upgrade.jsx";

const SettingsDataWorkflows = ({ ...props }) => {
  const { title, icon } = props;

  return <IconSegment title={title} icon={icon} body={<AccountUpgradeBlock />} />;
};

export default SettingsDataWorkflows;
