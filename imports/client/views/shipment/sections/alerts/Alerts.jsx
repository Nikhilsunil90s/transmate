import React from "react";
import { Segment, Message } from "semantic-ui-react";
import { Trans } from "react-i18next";
import get from "lodash.get";

const ShipmentAlertsSection = ({ shipment }) => {
  const ediError = get(shipment, ["edi", "error"]);
  const trackingFailed = (shipment.flags || []).includes("tracking-failed");
  const trackingFailures = [];

  return (
    <>
      {ediError && (
        <Segment
          basic
          padded
          className="edi-error"
          content={
            <div className="error-text">
              <Trans i18nKey="shipment.edi.error.header" />
            </div>
          }
        />
      )}
      {trackingFailed && (
        <Message
          error
          content={
            <div className="error-text">
              <b>Tracking failures</b>
              <br />
              {trackingFailures.length && (
                <ul>
                  {trackingFailures.map((failure, i) => (
                    <li key={i}>{failure}</li>
                  ))}
                </ul>
              )}
            </div>
          }
        />
      )}
    </>
  );
};

export default ShipmentAlertsSection;
