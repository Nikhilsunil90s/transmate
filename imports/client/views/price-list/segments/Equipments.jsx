import React from "react";
import { Segment } from "semantic-ui-react";
import EquipmentOverview from "/imports/client/components/forms/scope/Equipments.jsx";

const PriceListEquipmentSection = ({ ...props }) => {
  const { priceList = {}, onSave, security = {} } = props;
  return (
    <Segment padded="very" className="equipments">
      <EquipmentOverview
        equipments={priceList.equipments}
        onSave={onSave}
        canEdit={security.canModifyGridStructure}
      />
    </Segment>
  );
};

export default PriceListEquipmentSection;
