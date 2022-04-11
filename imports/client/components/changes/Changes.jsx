import React from "react";
import moment from "moment";
import { useTranslation } from "react-i18next";
import { Popup } from "semantic-ui-react";
import { useQuery } from "@apollo/client";
import { GET_SHIPMENT_CHANGES } from "./changes.queries";
import { IconSegment } from "/imports/client/components/utilities/IconSegment";
import { UserTag } from "/imports/client/components/tags";

const debug = require("debug")("shipment:ui:changes");

const row = (header, change) => {
  return (
    <div key={change.id}>
      {header ? (
        <>
          <h4 className="ui dividing header">
            {/* Change to collection <strong>{change.collection}</strong>{" "} */}
            {moment(change.ts).fromNow()} by <UserTag userId={change.userId} />
          </h4>
        </>
      ) : (
        ""
      )}

      <Popup
        content={
          <div>
            <h3>
              {change.collection} ({change.docId})
            </h3>
            <strong>on: </strong>
            {moment(change.ts).format("LLL")}
            <br />
            <strong>{change.change}: </strong>
            <pre>
              <code>{JSON.stringify(change.detail, null, 4)} </code>
            </pre>
          </div>
        }
        trigger={
          <span>
            {change.collection} fields {`'${change.keys.join(",")}'`} {change.change}
          </span>
        }
      />
    </div>
  );
};

export const ChangesOverview = props => {
  const { t } = useTranslation();
  const { id, shipmentId } = props;
  debug("get data for %s", shipmentId || id);
  const { data = {}, loading, error } = useQuery(GET_SHIPMENT_CHANGES, {
    variables: { shipmentId: shipmentId || id }
  });

  if (error) console.error(error);
  debug("shipment change data from apollo %o", { data, loading, error });
  const { changes = [] } = data.shipment || {};
  debug("changes %o", changes);
  let lastTs;
  const overview = changes.map(change => {
    let header = true;
    if (lastTs === moment(change.ts).fromNow()) header = false;

    // debug("dates", lastTs, new Date(change.ts));
    lastTs = moment(change.ts).fromNow();
    return row(header, change);
  });
  return (
    <IconSegment
      title={t("shipment.changes.title")}
      icon="history"
      name="history"
      body={<div>{overview}</div>}
      footer={undefined}
    />
  );
};

export default ChangesOverview;
