import React from "react";
import { Segment } from "semantic-ui-react";
import LaneOverview from "/imports/client/components/forms/scope/Lanes.jsx";

const PriceListLaneSection = ({ ...props }) => {
  const { priceList = {}, onSave, security = {} } = props;
  return (
    <Segment padded="very" className="lanes">
      <LaneOverview
        lanes={priceList.lanes}
        onSave={onSave}
        canEdit={security.canModifyGridStructure}
      />
    </Segment>
  );
};

export default PriceListLaneSection;
