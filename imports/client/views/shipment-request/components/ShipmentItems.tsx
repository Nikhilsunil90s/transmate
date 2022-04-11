import React from "react";
import get from "lodash.get";
import { Trans } from "react-i18next";
import { Button, Segment } from "semantic-ui-react";

import { SegmentBody as ShipmentItemOverview } from "/imports/client/views/shipment/sections/items/ItemSection";

const ShipmentItems = ({ ...props }) => {
  let itemSegmentRef = null;
  const { shipmentId, shipment } = props;
  const shipmentItems = get(shipment, ["nestedItems"]) || [];

  const fwdRef = ref => {
    itemSegmentRef = ref;
  };

  return (
    <Segment
      as="section"
      padded="very"
      content={
        <>
          <ShipmentItemOverview
            shipmentId={shipmentId}
            isEditing
            shipmentItems={shipmentItems}
            security={{
              canDragItems: true,
              canEditItems: true,
              canAddItem: true,
              canEditItemReferences: true,
              canEditWeights: true
            }}
            shipment={shipment}
            fwdRef={fwdRef}
            loading={false}
          />
          <Segment
            as="footer"
            content={
              <Button
                primary
                content={<Trans i18nKey="form.add" />}
                onClick={() => itemSegmentRef?.handleClickAdd()}
                data-test="addItemBn"
              />
            }
          />
        </>
      }
    />
  );
};

export default ShipmentItems;
