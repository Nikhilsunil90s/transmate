import React from "react";
import { Segment } from "semantic-ui-react";
import VolumeOverview from "/imports/client/components/forms/scope/Volumes.jsx";

const PriceListVolumeSection = ({ ...props }) => {
  const { priceList = {}, onSave, security = {} } = props;
  return (
    <Segment padded="very" className="volumes">
      <VolumeOverview
        volumes={priceList.volumes}
        onSave={onSave}
        canEdit={security.canModifyGridStructure}
      />
    </Segment>
  );
};

export default PriceListVolumeSection;
