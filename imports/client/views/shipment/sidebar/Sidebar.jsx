import React from "react";
import { Trans, useTranslation } from "react-i18next";
import { Header, Tab } from "semantic-ui-react";

import ShipmentInsights from "./Insights.jsx";
import ShipmentCosts from "./Costs.jsx";

const ShipmentSidebar = () => {
  const { t } = useTranslation();
  const panes = [
    {
      menuItem: t("shipment.carrier-select.tabs.costs"),
      render: () => (
        <Tab.Pane as="div" attached="false">
          <ShipmentCosts />
        </Tab.Pane>
      )
    },
    {
      menuItem: t("shipment.carrier-select.tabs.insight"),
      render: () => (
        <Tab.Pane as="div" attached="false">
          <ShipmentInsights />
        </Tab.Pane>
      )
    }
  ];

  return (
    <div className="carrier-select">
      <Header as="h5">
        <Trans i18nKey="shipment.carrier-select.title" />{" "}
      </Header>
      <Tab menu={{ secondary: true, size: "small", pointing: true }} panes={panes} />
    </div>
  );
};

export default ShipmentSidebar;
