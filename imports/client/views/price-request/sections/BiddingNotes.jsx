/* eslint-disable no-use-before-define */
import { useApolloClient } from "@apollo/client";
import React, { useEffect } from "react";
import { Trans, useTranslation } from "react-i18next";
import get from "lodash.get";
import SimpleSchema from "simpl-schema";
import SimpleSchema2Bridge from "uniforms-bridge-simple-schema-2";

// UI
import { AutoForm, LongTextField } from "uniforms-semantic";
import { IconSegment } from "../../../components/utilities/IconSegment";

import { tabPropTypes } from "../tabs/_tabProptypes";

import { UPDATE_BIDDER_TS, EDIT_BID } from "../utils/queries";
import { mutate } from "/imports/utils/UI/mutate";

//#region components
const BiddingNotesSegment = ({ priceRequest = {} }) => {
  const client = useApolloClient();
  const priceRequestId = priceRequest.id;
  const myNotes = get(priceRequest, ["bidders", 0, "notes"]);

  const saveNote = update => {
    mutate({
      client,
      query: {
        mutation: EDIT_BID,
        variables: { input: { priceRequestId, update } }
      },
      successMsg: "Notes saved"
    });
  };

  useEffect(() => {
    // sets the timeStamp for the bidder:
    mutate({ client, query: { mutation: UPDATE_BIDDER_TS, variables: { priceRequestId } } });
  }, []);

  return <NotesForm notes={myNotes} onFormSubmit={saveNote} />;
};

const NotesForm = ({ notes, onFormSubmit }) => {
  const { t } = useTranslation();
  return (
    <AutoForm
      model={{ notes }}
      schema={
        new SimpleSchema2Bridge(
          new SimpleSchema({
            notes: {
              type: String,
              optional: true,
              label: t("price.request.data.note"),
              uniforms: { component: LongTextField }
            }
          })
        )
      }
      onSubmit={onFormSubmit}
    />
  );
};
//#endregion

/** component gets rendered for the bidder only */
const PriceRequestBiddingNotes = ({ ...props }) => {
  const segmentData = {
    name: "notes",
    icon: "write",
    title: <Trans i18nKey="price.request.bidding.notes" />,
    body: <BiddingNotesSegment {...props} />
  };

  return <IconSegment {...segmentData} />;
};

PriceRequestBiddingNotes.propTypes = tabPropTypes;

export default PriceRequestBiddingNotes;
