import React from "react";
import { Trans, useTranslation } from "react-i18next";

import { Header, Checkbox, Popup, Icon } from "semantic-ui-react";

const ShipmentViewSettings = ({ state, updateState }) => {
  const { t } = useTranslation();
  function toggleOverview(checked) {
    const shipmentOverviewType = checked ? "mongo" : "GBQ";
    updateState({ shipmentOverviewType });
  }
  function toggleShared(checked) {
    updateState({ isShared: checked });
  }

  return (
    <>
      <Header dividing content={<Trans i18nKey="shipments.view.settings.title" />} />
      <div>
        <Checkbox
          label={t("shipments.view.settings.live")}
          checked={state.shipmentOverviewType === "mongo"}
          onChange={(_, { checked }) => toggleOverview(checked)}
        />
        {"    "}
        <Popup
          wide="very"
          content={t("shipments.view.settings.live_info")}
          trigger={<Icon name="question circle" />}
        />
      </div>
      <div>
        <Checkbox
          label={t("shipments.view.settings.isShared")}
          checked={state.isShared}
          onChange={(_, { checked }) => toggleShared(checked)}
        />
        {"    "}
        <Popup
          content={<Trans i18nKey="shipments.view.settings.isShared_info" />}
          trigger={<Icon name="question circle" />}
        />
      </div>
    </>
  );
};

export default ShipmentViewSettings;
