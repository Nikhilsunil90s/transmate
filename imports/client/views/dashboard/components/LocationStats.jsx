import React from "react";
import PropTypes from "prop-types";
import { Trans } from "react-i18next";
import { Button, Segment } from "semantic-ui-react";
import { GeoChart } from "/imports/client/components/charts";
import { generateRoutePath } from "/imports/client/router/routes-helpers";

const LocationStats = ({ loading, locations = [] }) => {
  return (
    <Segment loading={loading} padded attached size="big" as="section">
      <div className="section-container">
        <GeoChart locations={locations} />
        <i className="icon-location-pin" />
        <div className="section-content">
          {locations.length > 0 ? (
            <>
              <h1 className="section-title">{locations.length}</h1>
              <h4 className="section-subtitle">
                <Trans
                  i18nKey="dashboard.addresses.subtitleActive"
                  values={{ count: locations.length }}
                />
              </h4>
            </>
          ) : (
            <h4 className="section-subtitle">
              <Trans i18nKey="dashboard.addresses.subtitleInactive" />
            </h4>
          )}

          {locations.length > 0 ? (
            <Button
              basic
              as="a"
              href={generateRoutePath("addresses")}
              content={<Trans i18nKey="dashboard.addresses.go" />}
            />
          ) : (
            <Button
              basic
              as="a"
              href={generateRoutePath("addresses")}
              content={<Trans i18nKey="dashboard.addresses.create" />}
            />
          )}
        </div>
      </div>
    </Segment>
  );
};

LocationStats.propTypes = {
  loading: PropTypes.bool,
  locations: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      location: PropTypes.shape({
        lat: PropTypes.number,
        lng: PropTypes.number
      })
    })
  ).isRequired
};

export default LocationStats;
