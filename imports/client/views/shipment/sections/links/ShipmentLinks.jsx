/* eslint-disable no-use-before-define */
import React, { useState } from "react";
import { toast } from "react-toastify";
import { useMutation } from "@apollo/client";
import { Trans } from "react-i18next";
import PropTypes from "prop-types";
import get from "lodash.get";

import { List, Icon } from "semantic-ui-react";
import { IconSegment } from "../../../../components/utilities/IconSegment";
import { tabProptypes } from "/imports/client/views/shipment/utils/propTypes";
import { generateRoutePath } from "/imports/client/router/routes-helpers";
import { StatusTag } from "/imports/client/components/tags";
import { ConfirmComponent } from "/imports/client/components/modals";
import { UNLINK_PRICE_REQUEST_FROM_SHIPMENT } from "./queries";

const ICONS = {
  projectInbound: "arrow alternate circle down outline",
  projectOutbound: "arrow alternate circle up outline",
  priceRequest: "gavel"
};

const PATH = {
  projectInbound: {
    base: "project",
    params: { section: "Inbound" }
  },
  projectOutbound: {
    base: "project",
    params: { section: "Outbound" }
  },
  priceRequest: {
    base: "priceRequestEdit",
    params: { section: "data" }
  }
};

const COLORS = {
  projectOutbound: {
    active: "green"
  },
  projectInbound: {
    active: "green"
  },
  priceRequest: {
    requested: "green",
    archived: "grey"
  }
};

const LinkItem = ({ item, security, shipmentId }) => {
  const { canUnlinkPriceRequest } = security || {};
  const [show, showConfirm] = useState(false);
  const pathData = PATH[item.type];
  const path = generateRoutePath(pathData.base, { _id: item.id, ...pathData.params });
  const { status: itemStatus } = item.data || {};
  const [unlinkPriceRequest] = useMutation(UNLINK_PRICE_REQUEST_FROM_SHIPMENT, {
    onError(error) {
      console.error({ error });
      toast.error("Could not unlink price request");
    },
    onSuccess() {
      toast.success("Unlinked price request");
      showConfirm(false);
    }
  });

  const afterConfirmUnlinkPriceRequest = () => {
    unlinkPriceRequest({ variables: { shipmentId } });
  };

  return (
    <List.Item>
      {/* allow to unlink a price request by admin */}
      {item.type === "priceRequest" && canUnlinkPriceRequest(itemStatus) && (
        <List.Content floated="right">
          <Icon
            name="trash alternate outline"
            style={{ cursor: "pointer" }}
            onClick={() => showConfirm(true)}
          />
          <ConfirmComponent
            show={show}
            showConfirm={showConfirm}
            onConfirm={afterConfirmUnlinkPriceRequest}
          />
        </List.Content>
      )}
      <List.Icon name={ICONS[item.type]} />
      <List.Content>
        <List.Header>
          <Trans i18nKey={`shipment.links.types.${item.type}`} />
        </List.Header>
        <List.Description>
          <div style={{ display: "flex" }}>
            <a href={path}>{get(item, ["data", "title"]) || item.type}</a>
            {itemStatus && (
              <>
                {" | "}
                <StatusTag color={COLORS[item.type]?.[itemStatus] || "red"} text={itemStatus} />
              </>
            )}
          </div>
        </List.Description>
      </List.Content>
    </List.Item>
  );
};

LinkItem.propTypes = {
  item: PropTypes.shape({
    id: PropTypes.string.isRequired,
    type: PropTypes.string,
    data: PropTypes.object
  })
};

const ShipmentLinks = ({ shipment, shipmentId, security, loading }) => {
  const { links = [] } = shipment;

  if (links.length === 0) return null;

  return (
    <IconSegment title={<Trans i18nKey="shipment.links.title" />} icon="magnet" loading={loading}>
      <List>
        {links.map((item, i) => (
          <LinkItem key={i} {...{ item, shipmentId, security }} />
        ))}
      </List>
    </IconSegment>
  );
};

ShipmentLinks.propTypes = tabProptypes;

export default ShipmentLinks;
