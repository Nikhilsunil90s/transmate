import React from "react";
import moment from "moment";
import { Trans } from "react-i18next";
import { Button, Divider, Icon, Segment } from "semantic-ui-react";

import { useQuery } from "@apollo/client";
import Loader from "/imports/client/components/utilities/Loader.jsx";
import { UserTag } from "/imports/client/components/tags";
import ShipmentStop from "./components/ShipmentStop";

import { GET_SHIPMENT_ASIDE } from "./utils/queries";
import useRoute from "../../router/useRoute";
import { generateRoutePath } from "../../router/routes-helpers";

const debug = require("debug")("shipment:aside");

const ShipmentDetails = () => {
  const { params } = useRoute();
  const shipmentId = params._id;
  const { data = {}, loading, error } = useQuery(GET_SHIPMENT_ASIDE, {
    variables: { shipmentId },
    fetchPolicy: "cache-only",
    skip: !shipmentId
  });
  debug("apollo data %o", { data, loading, error });

  if (loading || !data.shipment)
    return (
      <Segment basic padded="very">
        <Loader loading />
      </Segment>
    );
  const shipment = data.shipment || {};

  const canEdit = true; // "canEditRequestedDates";

  const title = (
    <Trans i18nKey="shipment.details.created" values={{ value: shipment.account?.name }} />
  );
  return (
    <>
      {shipment && (
        <Segment basic padded="very">
          <h5>{title}</h5>
          <div>
            <Trans i18nKey="shipment.details.creationBy" />
            <UserTag userId={shipment.created?.by} />{" "}
            {<Trans i18nKey="shipment.details.creationOn" />}
            {moment(shipment.created?.at).format("MMMM D")}
            {", "}
            {moment(shipment.created?.at).format("HH:mm")}
          </div>
          <Divider />
          <div className="stops">
            <ShipmentStop {...{ shipment, stop: "pickup", canEdit }} />
            <ShipmentStop {...{ shipment, stop: "delivery", canEdit }} />
          </div>
          <h5>
            <Trans i18nKey="shipment.details.tracking" />
          </h5>

          <Button
            as="a"
            primary
            icon="external square"
            content={<Trans i18nKey="shipment.details.trackingLink" />}
            href={generateRoutePath("track", { shipmentId })}
            target="blank"
          />

          {shipment.status !== "completed" && (
            <div>
              {shipment.tracking?.position && (
                <>
                  <Icon name="truck" />
                  Live tracking <br />
                </>
              )}
              {shipment.eta && (
                <Trans
                  i18nKey="shipment.header.eta"
                  values={{ value: moment(shipment.eta, "DD/MM, HH:mm") }}
                />
              )}
            </div>
          )}

          <Divider />
          <h5>
            <Trans i18nKey="shipment.details.shipper" />
          </h5>
          <div className="item-icon">
            <i className="browser icon" />
            <div>
              <b>{shipment.shipper?.name}</b>
              <span style={{ opacity: 0.5 }}>—{shipment.shipper?.id}</span>
            </div>
          </div>

          {shipment.carrier && (
            <>
              <h5>
                <Trans i18nKey="shipment.details.carrier" />
              </h5>
              <div>
                {shipment.carrier?.name}
                <span style={{ opacity: 0.5 }}>—{shipment.carrier?.id}</span>
              </div>
            </>
          )}
        </Segment>
      )}
    </>
  );
};

export default ShipmentDetails;
