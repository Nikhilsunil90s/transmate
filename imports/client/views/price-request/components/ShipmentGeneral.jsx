/* eslint-disable camelcase */
/* eslint-disable no-use-before-define */
import React from "react";
import { Table, Message, Icon } from "semantic-ui-react";
import { Trans } from "react-i18next";

import get from "lodash.get";

import TrackAddress from "/imports/client/views/shipment-track/TrackAddress.jsx";
import { DateTimeTZtoggleTag } from "/imports/client/components/tags";

/** @param {{shipment: any, hasMultiStage: boolean; className: string; canEdit?: boolean; onClickEditLocation:Function}} param0 */
const GeneralSummary = ({
  shipment,
  hasMultiStage,
  className = "",
  canEdit,
  onClickEditLocation
}) => {
  const data = [
    {
      topic: "location",
      pickup: (
        <>
          {canEdit && (
            <Icon
              name="edit"
              color="grey"
              style={{ float: "right", cursor: "pointer" }}
              onClick={() => onClickEditLocation("pickup")}
            />
          )}
          <TrackAddress location={get(shipment, ["pickup", "location"])} />
        </>
      ),
      delivery: (
        <>
          {canEdit && (
            <Icon
              name="edit"
              color="grey"
              style={{ float: "right", cursor: "pointer" }}
              onClick={() => onClickEditLocation("delivery")}
            />
          )}
          <TrackAddress location={get(shipment, ["delivery", "location"])} />
        </>
      )
    },
    {
      topic: "date",
      pickup: (
        <DateTimeTZtoggleTag
          date={get(shipment, ["pickup", "date"])}
          locationTZ={get(shipment, ["pickup", "location", "timeZone"])}
          options={{ dateStyle: "long", timeStyle: "medium" }}
        />
      ),
      delivery: (
        <DateTimeTZtoggleTag
          date={get(shipment, ["delivery", "date"])}
          locationTZ={get(shipment, ["delivery", "location", "timeZone"])}
          options={{ dateStyle: "long", timeStyle: "medium" }}
        />
      )
    }
  ];
  return (
    <>
      <Table
        definition
        celled
        headerRow={["", "Pickup", "Delivery"]}
        renderBodyRow={({ topic, pickup, delivery }) => ({
          key: topic,
          cells: [
            { key: "label", content: topic },
            { key: "pickup", content: pickup },
            { key: "delivery", content: delivery }
          ]
        })}
        tableData={data}
        className={className}
      />
      {/* Show warning if there is more than 1 stage */}
      {hasMultiStage && (
        <Message
          attached="bottom"
          warning
          content={<Trans i18nKey="price.request.data-single.multiStage" />}
        />
      )}
    </>
  );
};

export default GeneralSummary;
