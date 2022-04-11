import React from "react";
import PropTypes from "prop-types";
import { Trans } from "react-i18next";
import { Button, Segment } from "semantic-ui-react";
import { DonutChart } from "/imports/client/components/charts";
import { generateRoutePath } from "/imports/client/router/routes-helpers";

const ShipmentStats = ({ loading, counts }) => {
  let total = 0;
  const data = [];
  const labels = [];
  Object.entries(counts)
    .filter(([k]) => k !== "__typename")
    .forEach(([k, v]) => {
      total += v;
      data.push(v);
      labels.push(k);
    });

  return (
    <Segment loading={loading} padded attached size="big" as="section">
      <div className="section-container">
        <div style={{ width: "100%", height: "400px" }}>
          <DonutChart data={data} labels={labels} />
        </div>
        <i className="icon-compass" />
        <div className="section-content">
          {total > 0 ? (
            <>
              <h1 className="section-title">{total}</h1>
              <h4 className="section-subtitle">
                <Trans i18nKey="dashboard.shipments.subtitleActive" values={{ count: total }} />
              </h4>
            </>
          ) : (
            <h4 className="section-subtitle">
              <Trans i18nKey="dashboard.shipments.subtitleInactive" />
            </h4>
          )}
          {total > 0 ? (
            <Button
              basic
              as="a"
              href={generateRoutePath("shipments")}
              content={<Trans i18nKey="dashboard.shipments.go" />}
            />
          ) : (
            <Button
              primary
              as="a"
              href={generateRoutePath("newShipment")}
              content={<Trans i18nKey="dashboard.shipments.create" />}
            />
          )}
        </div>
      </div>
    </Segment>
  );
};

ShipmentStats.propTypes = {
  loading: PropTypes.bool,
  counts: PropTypes.shape({
    planned: PropTypes.number,
    completed: PropTypes.number,
    started: PropTypes.number,
    draft: PropTypes.number
  }).isRequired
};

export default ShipmentStats;
