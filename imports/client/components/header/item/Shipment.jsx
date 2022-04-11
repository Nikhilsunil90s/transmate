import React from "react";
import { useQuery } from "@apollo/client";
import moment from "moment";
import { Trans } from "react-i18next";
import { Icon, Loader } from "semantic-ui-react";
import gql from "graphql-tag";
import get from "lodash.get";
import ItemHeader from "../ItemHeader.jsx";
import useRoute from "/imports/client/router/useRoute.js";

const debug = require("debug")("header");

const SHIPMENT_QUERY = gql`
  query getShipmentInfoHeader($shipmentId: String!) {
    shipment: getShipmentInfoHeader(shipmentId: $shipmentId) {
      id
      number
      references {
        number
      }
      status
      eta
      tracking {
        active
        position {
          lat
          lng
          source
        }
      }
    }
  }
`;

const ShipmentHeader = () => {
  const { params } = useRoute();
  const shipmentId = params._id;
  const { data = {}, loading, error } = useQuery(SHIPMENT_QUERY, {
    variables: { shipmentId },
    skip: !shipmentId
  });

  debug("header query %o", { data, loading, error });
  const shipment = data.shipment || {};
  return (
    <ItemHeader>
      {loading ? (
        <Loader active inline size="tiny" />
      ) : (
        <div className="main">
          <div>
            <Trans
              i18nKey="shipment.header.title"
              values={{ value: get(shipment, "references.number") || shipment.number }}
            />
          </div>
          <div className="meta center">
            <Trans i18nKey="shipment.header.status" values={{ value: shipment.status }} />
          </div>
          {shipment.status !== "completed" && shipment.eta && (
            <div className="meta right">
              <span className="important">
                {shipment.tracking?.active && shipment.tracking?.position && (
                  <>
                    <Icon name="truck" />

                    <Trans
                      i18nKey="shipment.header.eta"
                      values={{ value: moment(shipment.eta).format("DD/MM, HH:mm") }}
                    />
                  </>
                )}
              </span>
            </div>
          )}
        </div>
      )}
      <div className="aside" />
    </ItemHeader>
  );
};

export default ShipmentHeader;
