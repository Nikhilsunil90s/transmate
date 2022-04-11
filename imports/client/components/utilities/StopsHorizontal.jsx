import React from "react";
import PropTypes from "prop-types";
import { Icon, List } from "semantic-ui-react";

function formatLocation(loc) {
  if (!loc) return " - ";
  if (loc.locode) return loc.locode;
  if (loc.zip) return `${loc.country}-${loc.zip}`;
  return loc.country;
}

const StopsHorizontal = ({ stops }) => {
  return (
    <List size="mini" relaxed horizontal className="stops">
      <List.Item>
        <Icon circular color="blue" name="check" />
        <List.Content>
          <a className="header">{formatLocation(stops[0].from)}</a>
        </List.Content>
      </List.Item>
      {stops.map((stop, i) => (
        <List.Item key={`stop-${i}`}>
          <Icon circular color="blue" name="check" />
          <List.Content>
            <a className="header">{formatLocation(stop.to)}</a>
          </List.Content>
        </List.Item>
      ))}
    </List>
  );
};

const stopType = PropTypes.shape({
  locode: PropTypes.string,
  country: PropTypes.string,
  zip: PropTypes.string
});

StopsHorizontal.propTypes = {
  stops: PropTypes.arrayOf(
    PropTypes.shape({
      from: stopType,
      to: stopType
    })
  )
};

export default StopsHorizontal;
