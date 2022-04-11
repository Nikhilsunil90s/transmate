/* eslint-disable camelcase */
/* eslint-disable no-use-before-define */
import React from "react";
import PropTypes from "prop-types";

import { Trans } from "react-i18next";
import { Grid, Button, Segment } from "semantic-ui-react";
import get from "lodash.get";

// UI
import { ShipmentReferences, GeneralSummary, RequirementSummary } from "../components";
import ItemTable from "/imports/client/views/shipment/sections/items/overview-simple/ItemTable";

import { buildNestedItems } from "/imports/api/items/items-helper";

import { tabPropTypes } from "../tabs/_tabProptypes";
import { generateRoutePath } from "/imports/client/router/routes-helpers";

//#region components
const ShipmentSummary = ({ shipment, nestedItems, priceRequest }) => {
  const { requirements = {} } = priceRequest;
  const hasRequirements = Object.keys(requirements).length > 0;
  const hasMultiStage = get(shipment, "stageCount") > 1;
  return (
    <Grid>
      <Grid.Row>
        <Grid.Column>
          <ShipmentReferences shipment={shipment} />
        </Grid.Column>
      </Grid.Row>
      <Grid.Row>
        <Grid.Column>
          <h3>
            <Trans i18nKey="price.request.data-single.general" />
          </h3>
          <GeneralSummary {...{ shipment, hasMultiStage }} />
        </Grid.Column>
      </Grid.Row>
      <Grid.Row>
        <Grid.Column>
          <h3>
            <Trans i18nKey="price.request.data-single.items" />
          </h3>
          <ItemTable items={nestedItems} />
          <Button
            primary
            as="a"
            href={generateRoutePath("shipment", { _id: shipment.id })}
            target="_blank"
            content="View details"
          />
        </Grid.Column>
      </Grid.Row>
      {hasRequirements && (
        <Grid.Row>
          <Grid.Column>
            <h3>
              <Trans i18nKey="price.request.data-single.requirements" />
            </h3>
            <RequirementSummary requirements={requirements} />
          </Grid.Column>
        </Grid.Row>
      )}
    </Grid>
  );
};

export const PriceRequestDataSingle = ({ priceRequest = {}, shipment = {}, nestedItems }) => {
  return <Segment content={<ShipmentSummary {...{ priceRequest, shipment, nestedItems }} />} />;
};
//#endregion

const PriceRequestDataLoader = props => {
  const { shipment, priceRequest } = props;
  const nestedItems = shipment ? buildNestedItems(shipment.nestedItems) : [];

  return <PriceRequestDataSingle {...{ priceRequest, shipment, nestedItems }} />;
};

PriceRequestDataLoader.propTypes = {
  ...tabPropTypes,
  shipment: PropTypes.object
};

export default PriceRequestDataLoader;
