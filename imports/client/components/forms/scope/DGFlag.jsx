import React from "react";
import { useTranslation } from "react-i18next";
import { Checkbox } from "semantic-ui-react";

const DGOverview = () => {
  const { t } = useTranslation();
  return (
    <>
      <div className="field">
        <Checkbox name="DG" label={t("general.DG")} disabled checked />
      </div>
      <div className="field">
        <Checkbox name="non-DG" label={t("general.non-DG")} disabled checked />
      </div>
    </>
  );
};

export default DGOverview;
