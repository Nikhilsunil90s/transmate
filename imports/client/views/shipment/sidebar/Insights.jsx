import React from "react";
import get from "lodash.get";

import { useQuery } from "@apollo/client";
import { Trans } from "react-i18next";
import { List, Table } from "semantic-ui-react";
import { CurrencyTag, NumberTag } from "/imports/client/components/tags";
import useRoute from "/imports/client/router/useRoute";
import { GET_SHIPMENT_INSIGHTS } from "./insight-queries";

const debug = require("debug")("shipment:sidebar");

function formatLocation(loc = {}) {
  if (loc.locode) return loc.locode;
  if (loc.zip) return `${loc.country}-${loc.zip}`;
  return loc.country;
}

const Detail = ({ insight }) => {
  if (!insight) return <Trans i18nKey="shipment.carrier-select.insights.no-detail" />;

  const steps = insight.steps || [];

  const tableData = [
    {
      label: <Trans i18nKey="shipment.carrier-select.insights.distance" />,
      content: <NumberTag value={insight.totalKm} digits={3} suffix="km" />
    },
    {
      label: <Trans i18nKey="shipment.carrier-select.insights.CO2" />,
      content: <NumberTag value={insight.totalCO2} digits={3} suffix="kg" />
    },
    {
      label: <Trans i18nKey="shipment.carrier-select.insights.leadTime" />,
      content: <NumberTag value={insight.totalLeadtime} suffix="d" />
    },
    {
      label: <Trans i18nKey="shipment.carrier-select.insights.cost" />,
      content: <CurrencyTag value={insight.totalCost} currency="EUR" />
    }
  ];

  const renderBodyRow = ({ label, content }, i) => ({
    key: `insightDetail-${i}`,
    cells: [
      { key: "label", content: label },
      { key: "content", content }
    ]
  });

  return (
    <>
      <List className="stops" size="mini" relaxed horizontal>
        <List.Item
          icon={{ circular: true, color: "blue", name: "check" }}
          content={<List.Header>{formatLocation(steps[0]?.from)}</List.Header>}
        />
        {steps.map((step, i) => (
          <List.Item
            key={i}
            icon={{ circular: true, color: "blue", name: "check" }}
            content={<List.Header>{formatLocation(step.to)}</List.Header>}
          />
        ))}
      </List>
      <Table definition celled renderBodyRow={renderBodyRow} tableData={tableData} />
    </>
  );
};

const InsightDetail = ({ insight, icon, header }) => (
  <>
    <List>
      <List.Item icon={icon} content={<List.Header content={header} />} />
    </List>
    <Detail {...{ insight }} />
  </>
);

const Insights = ({ insights }) => {
  const road = get(insights, ["road", 0]);
  const ocean = get(insights, ["ocean", 0]);
  const air = get(insights, ["air", 0]);

  return (
    <>
      {road && (
        <InsightDetail
          icon="truck"
          insight={road}
          header={<Trans i18nKey="shipment.carrier-select.insights.road" />}
        />
      )}
      {ocean && (
        <InsightDetail
          icon="anchor"
          insight={ocean}
          header={<Trans i18nKey="shipment.carrier-select.insights.ocean" />}
        />
      )}
      {air && (
        <InsightDetail
          icon="plane"
          insight={air}
          header={<Trans i18nKey="shipment.carrier-select.insights.air" />}
        />
      )}
    </>
  );
};

const ShipmentInsightsSidebar = ({ shipmentId }) => {
  const { params } = useRoute();
  const sId = shipmentId || params._id;

  const { data = {}, loading, error } = useQuery(GET_SHIPMENT_INSIGHTS, {
    variables: { shipmentId: sId },
    skip: !sId
  });

  debug("shipment id %o , insights data %o", sId, data);

  const { insights } = data;

  if (error) console.error(error);
  if (loading)
    return (
      <div className="insight">
        <Trans i18nKey="general.loading" />
      </div>
    );

  return (
    <div className="insight">
      {!!insights ? (
        <Insights insights={insights} />
      ) : (
        <Trans i18nKey="shipment.carrier-select.insights.empty" />
      )}
    </div>
  );
};

export default ShipmentInsightsSidebar;
