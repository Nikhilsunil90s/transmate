import React from "react";
import moment from "moment";
import get from "lodash.get";
import { useQuery } from "@apollo/client";
import { Trans } from "react-i18next";

import { Container, Divider, Grid, Icon } from "semantic-ui-react";

import { GET_SHIPMENT_TRACKING_INFO } from "./utils/queries";
import AddressComponent from "./TrackAddress";
import { DateTimeTag } from "/imports/client/components/tags";
import useRoute from "../../router/useRoute";

const debug = require("debug")("shipment:tracking");

function calculateProgress(status) {
  let progress = 0;
  if (status === "planned") {
    progress = 5;
  }
  if (status === "started") {
    progress = 50;
  }
  if (status === "partial") {
    progress = 75;
  }
  if (status === "completed") {
    progress = 100;
  }
  return progress;
}

const Track = () => {
  const { goRoutePath, params } = useRoute();
  const { shipmentId } = params;
  const { data = {}, loading, error } = useQuery(GET_SHIPMENT_TRACKING_INFO, {
    variables: { shipmentId },
    skip: !shipmentId
  });
  debug("tracking data for: %s :%o", shipmentId, { data, loading, error });
  if (error) console.error({ error });
  if (loading) return "Loading...";
  const shipment = data.shipment || {};

  if (!shipment) goRoutePath("/404");
  const progress = calculateProgress(shipment.status);
  const pickupDate = get(shipment, ["pickup", "datePlanned"]) || get(shipment, ["pickup", "date"]);
  const deliveryDate =
    get(shipment, ["delivery", "datePlanned"]) || get(shipment, ["delivery", "date"]);
  const updates = [...(shipment.updates || [])];

  return (
    <Container fluid className="limit">
      <Grid>
        <Grid.Column width={12}>
          <h3>
            <Trans i18nKey="track.title" />
          </h3>
          <p>
            <Trans i18nKey="track.description" />
          </p>
        </Grid.Column>
        <Grid.Column width={4} textAlign="right">
          <h4>
            <strong>
              <Trans i18nKey="track.shipment" values={{ value: shipment.number }} />
            </strong>
          </h4>
          <h4>
            <Trans i18nKey="track.id" values={{ value: shipmentId }} />
          </h4>
        </Grid.Column>

        <Grid.Row className="fromto">
          <Grid.Column width={5}>
            <div>
              <h5>
                <Trans i18nKey="track.from" />
              </h5>
              <AddressComponent location={shipment.pickup?.location} />
              {pickupDate && (
                <div className="time">
                  <Icon name="checked calendar" />
                  <DateTimeTag date={pickupDate} />
                </div>
              )}
            </div>
          </Grid.Column>
          <Grid.Column width={6}>
            <div className="center aligned status">
              <div>
                <div
                  className="truck"
                  style={{ ...(progress ? { paddingLeft: `calc( ${progress}% - 12px )` } : {}) }}
                >
                  <Icon size="large" name="shipping" flipped="horizontally" />
                </div>
                <div className="track">
                  <div className="fill" style={{ width: `${progress}%` }} />
                </div>
              </div>
            </div>
          </Grid.Column>
          <Grid.Column width={5}>
            <div>
              <h5>
                <Trans i18nKey="track.to" />
              </h5>
              <AddressComponent location={shipment.delivery?.location} />
              {deliveryDate && (
                <div className="time">
                  <Icon name="checked calendar" />
                  <DateTimeTag date={deliveryDate} />
                </div>
              )}
            </div>
          </Grid.Column>
        </Grid.Row>

        <Grid.Row>
          <Grid.Column width={5} />
          <Grid.Column width={6}>
            <div className="statusbox">
              <div>
                <div className="statusaside">
                  <Icon name="clock" />
                  <Trans i18nKey="shipment.header.status" values={{ value: shipment.status }} />
                </div>
                {shipment.eta && (
                  <div>
                    <Trans
                      i18nKey="shipment.header.eta"
                      value={moment(shipment.eta).format("DD/MM, HH:mm")}
                    />
                  </div>
                )}
              </div>
            </div>
            <br />
            <div className="statusbox">
              <div className="timeline">
                {updates
                  .sort((a, b) => a.ts - b.ts)
                  .map((update, i) => {
                    let ts = new Date(update.ts);
                    if (update.data?.ts) {
                      ts = new Date(update.data.ts);
                    }
                    return (
                      <div className="event" key={i}>
                        <Trans
                          i18nKey={`shipment.updates.${update.action}`}
                          values={{ value: update.data }}
                        />
                        {": "}
                        {/* some events set timestamps that will be displayed */}
                        <DateTimeTag date={ts} />
                        <Divider />
                      </div>
                    );
                  })}
              </div>
            </div>
          </Grid.Column>
          <Grid.Column width={6} />
        </Grid.Row>
      </Grid>
    </Container>
  );
};

export default Track;
