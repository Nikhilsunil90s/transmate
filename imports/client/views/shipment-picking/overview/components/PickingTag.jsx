import React from "react";
import PropTypes from "prop-types";
import { Label } from "semantic-ui-react";
import { useMutation, gql } from "@apollo/client";

const debug = require("debug")("picking-overview:UI");

const RELEASED_TAG = "approvedForPicking";

export const UPDATE_TAGS = gql`
  mutation updatePickingTags($shipmentId: String!, $tags: [String]) {
    updateShipmentTags(shipmentId: $shipmentId, tags: $tags) {
      id
      tags
    }
  }
`;

/**
 * @param {{shipmentId: string, tags?: [string]}} param0
 */
const PickingTag = ({ shipmentId, tags }) => {
  const [updateTags, { loading, error, data }] = useMutation(UPDATE_TAGS);
  debug("updated tag", { error, data });
  const hasReleasedTag = (tags || []).includes(RELEASED_TAG);
  const toggleTag = () => {
    let updatedTags = tags || [];
    if (hasReleasedTag) {
      updatedTags = updatedTags.filter(tag => tag !== RELEASED_TAG);
    } else {
      updatedTags = [...updatedTags, RELEASED_TAG];
    }
    updateTags({ variables: { shipmentId, tags: updatedTags } });
  };

  if (loading) return "...";
  return (
    <Label
      content={hasReleasedTag ? "Released" : "Waiting"}
      color={hasReleasedTag ? "green" : null}
      onClick={e => {
        e.stopPropagation();
        toggleTag();
      }}
    />
  );
};

PickingTag.propTypes = {
  shipmentId: PropTypes.string.isRequired,
  tags: PropTypes.arrayOf(PropTypes.string)
};

export default PickingTag;
