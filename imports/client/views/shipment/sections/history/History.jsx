/* eslint-disable no-use-before-define */
import React, { useContext } from "react";
import moment from "moment";
import { Trans } from "react-i18next";
import get from "lodash.get";

import { IconSegment } from "../../../../components/utilities/IconSegment";
import { tabProptypes } from "/imports/client/views/shipment/utils/propTypes";
import { ReactTable } from "/imports/client/components/tables";
import { UserTag, DocumentTag, PartnerTag } from "/imports/client/components/tags";
import LoginContext from "/imports/client/context/loginContext";

const HistoryCell = ({ action, data }) => {
  let text = "";
  if (["items", "costs", "partners"].includes(action) && data.event) {
    const { event } = data;
    text = <Trans i18nKey={`shipment.history.${action}.${event}`} />;
  } else {
    text = <Trans i18nKey={`shipment.history.${action}`} />;
  }
  if (action === "allocated")
    return (
      <>
        {text}
        <UserTag userId={get(data, "driverId")} />
      </>
    );
  if (action === "document") return <DocumentTag {...{ id: data.id, text }} />;
  if (action === "assigned")
    return (
      <>
        {text}
        {": "}
        <PartnerTag accountId={data.carrierId} />
      </>
    );
  return text;
};

const ShipmentHistory = ({ shipment }) => {
  const { updates = [] } = shipment;
  const { accountId: myAccountId } = useContext(LoginContext);

  return (
    <IconSegment
      title={<Trans i18nKey="shipment.history.title" />}
      icon="history"
      name="history"
      body={
        <ReactTable
          data={updates}
          columns={[
            { accessor: "ts", className: "two wide", Cell: ({ value }) => moment(value).fromNow() },
            {
              id: "owner",
              className: "two wide",
              Cell: ({
                row: {
                  original: { userId, accountId }
                }
              }) => (
                <>
                  <UserTag userId={userId} />
                  {accountId !== myAccountId && (
                    <>
                      (<PartnerTag accountId={accountId} />)
                    </>
                  )}
                </>
              )
            },
            {
              id: "action",
              className: "ten wide",
              Cell: ({ row: { original } }) => <HistoryCell {...original} />
            }
          ]}
          TheadComponent={() => null}
        />
      }
    />
  );
};

ShipmentHistory.propTypes = tabProptypes;

export default ShipmentHistory;

// translations:
// t("shipment.history.created"),
// t("shipment.history.draft"),
// t("shipment.history.allocated"),
// t("shipment.history.planned"),
// t("shipment.history.started"),
// t("shipment.history.completed"),
// t("shipment.history.deleted"),
// t("shipment.history.archived"),
// t("shipment.history.canceled"),

// t("shipment.history.pickup.arrival"),
// t("shipment.history.pickup.departure"),
// t("shipment.history.delivery.arrival"),
// t("shipment.history.delivery.departure"),
// t("shipment.history.assigned"),

// t("shipment.history.non-conformance"),
// t("shipment.history.document"),

// t("shipment.history.items.add"),
// t("shipment.history.items.update"),
// t("shipment.history.items.remove"),

// t("shipment.history.costs.add"),
// t("shipment.history.costs.update"),
// t("shipment.history.costs.reset"),
// t("shipment.history.costs.decline"),
// t("shipment.history.costs.approve"),

// t("shipment.history.partners.add)"
// t("shipment.history.partners.remove)"
