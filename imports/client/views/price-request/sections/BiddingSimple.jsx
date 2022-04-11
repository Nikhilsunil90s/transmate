/* eslint-disable no-use-before-define */
import React from "react";
import { Trans, useTranslation } from "react-i18next";
import PropTypes from "prop-types";
import SimpleSchema2Bridge from "uniforms-bridge-simple-schema-2";

// UI
import { Table, Segment, Divider } from "semantic-ui-react";
import { AutoForm, AutoField, LongTextField } from "uniforms-semantic";
import CurrencyAmountInput from "../../../components/forms/uniforms/CurrencyAmountInput";
import StaticField from "../../../components/forms/uniforms/StaticField";
import {
  ListRow,
  ListRowItem,
  NestedRow,
  ListAddField
} from "../../../components/forms/uniforms/nestedTable";
import HiddenField from "../../../components/forms/uniforms/HiddenField";
import Loader from "../../../components/utilities/Loader";

import { ChargeLinesSchema } from "../../../../api/_jsonSchemas/simple-schemas/_utilities/chargeLines";

const debug = require("debug")("priceRequest:bidding");

//#region components
const QuickbidSchema = ChargeLinesSchema.extend({
  notes: {
    type: String,
    optional: true
  }
});

export const SimpleBidForm = ({ chargeLines = [], bid, onModifyBid, settings = {}, disabled }) => {
  const { t } = useTranslation();

  debug("SimpleBidForm settings %o, disabled %o", settings, disabled);
  const { canEditCurrency, canCommentRates, canAddCharges } = settings;

  return (
    <AutoForm
      schema={new SimpleSchema2Bridge(QuickbidSchema)}
      validator={{ clean: true }}
      model={{ chargeLines, notes: (bid || {}).notes || "" }}
      onSubmit={onModifyBid}
      autosave
      autosaveDelay={0}
      disabled={disabled}
      data-test="simpleBid"
    >
      <Table>
        <Table.Body>
          <ListRow name="chargeLines">
            <ListRowItem name="$">
              <NestedRow name="">
                <StaticField name="name" />
                <CurrencyAmountInput
                  name="amount"
                  options={{ disableCurrency: !canEditCurrency }}
                />

                {canCommentRates ? (
                  <AutoField
                    name="comment"
                    placeholder={t("price.request.bidSimple.rateComment")}
                  />
                ) : (
                  <HiddenField name="comment" />
                )}
              </NestedRow>
            </ListRowItem>
          </ListRow>
        </Table.Body>
      </Table>
      {canAddCharges && <ListAddField name="chargeLines.$" />}
      <LongTextField name="notes" label={t("price.request.bidSimple.note")} />
    </AutoForm>
  );
};
//#endregion

const PriceRequestBiddingSimple = ({ chargeLines, bid, settings, onModifyBid, canBid }) => {
  debug("PriceRequestBiddingSimple ", { settings, chargeLines, bid });

  return (
    <>
      <Divider />
      <h4>
        <Trans i18nKey="price.request.bidSimple.title" />
      </h4>
      <Segment>
        <>
          <Loader />
          <SimpleBidForm {...{ chargeLines, bid, settings, onModifyBid, disabled: !canBid }} />
        </>
      </Segment>
    </>
  );
};

PriceRequestBiddingSimple.propTypes = {
  bid: PropTypes.object,
  onSubmit: PropTypes.func,
  refreshData: PropTypes.func,
  canBid: PropTypes.bool,
  settings: PropTypes.object,
  chargeLines: PropTypes.arrayOf(PropTypes.object)
};

export default PriceRequestBiddingSimple;
