import { useMutation } from "@apollo/client";
import React from "react";
import { toast } from "react-toastify";
import { Segment } from "semantic-ui-react";
import UOMConversions from "/imports/client/components/forms/scope/Conversions";

import {
  UPDATE_PRICE_LIST_CONVERSION,
  COPY_CONVERSIONS_FROM_OTHER_PRICELIST
} from "../utils/queries";

const PriceListConversionSection = ({ ...props }) => {
  const { priceList = {}, priceListId, security = {} } = props;
  const [updateConversion] = useMutation(UPDATE_PRICE_LIST_CONVERSION);
  const [copyConversion] = useMutation(COPY_CONVERSIONS_FROM_OTHER_PRICELIST);

  const handleSaveConversions = ({ conversions }, callback) => {
    updateConversion({
      variables: { input: { priceListId, conversions } }
    })
      .then(() => {
        toast.success("Conversions saved");
        // eslint-disable-next-line no-unused-expressions
        callback && callback();
      })
      .catch(err => {
        console.error(err);
        toast.error("could not save conversions");
      });
  };

  const handleCopyFromPriceList = ({ priceListId: sourcePriceListId }, cb) => {
    copyConversion({
      variables: {
        input: {
          priceListId,
          sourcePriceListId
        }
      }
    })
      .then(() => {
        toast.success("Conversions copied");
        if (cb) cb();
      })
      .catch(error => {
        console.error(error);
        toast.error("Could not copy conversions");
      });
  };

  return (
    <Segment padded="very" className="equipments">
      <UOMConversions
        conversions={priceList.uoms?.conversions}
        onSave={handleSaveConversions}
        canEdit={security.canModifyConversions}
        copyFromPriceListQuery={{
          type: "contract",
          carrierId: priceList.carrierId
        }}
        onCopyFromPriceList={handleCopyFromPriceList}
      />
    </Segment>
  );
};

export default PriceListConversionSection;
