/* eslint-disable no-use-before-define */
import React, { useContext } from "react";
import { toast } from "react-toastify";
import { useMutation } from "@apollo/client";
import { Button } from "semantic-ui-react";
import { Trans } from "react-i18next";

import { CREATE_TENDER_BID } from "../utils/queries";
import useRoute from "/imports/client/router/useRoute";
import LoginContext from "/imports/client/context/loginContext";

const debug = require("debug")("tender:overview");

const REQUIRED_ACCOUNT_FEATURE = "tenderify";

const TenderOverviewFooter = () => {
  const { account } = useContext(LoginContext);
  const { goRoute } = useRoute();
  const [createTender, { loading }] = useMutation(CREATE_TENDER_BID, {
    onError(error) {
      console.error({ error });
      toast.error("Could not create tender");
    },
    onCompleted(data) {
      debug("data from create tenderBid", data);
      const newTenderBidId = data?.newTenderBid?.id;
      if (!newTenderBidId) throw new Error("No id returned");
      goRoute("bid", { _id: newTenderBidId });
    }
  });
  const canCreateTenderBid = account.hasFeature(REQUIRED_ACCOUNT_FEATURE);

  debug("can create tenderBid: %s", canCreateTenderBid);

  return (
    <>
      {canCreateTenderBid && (
        <Button
          primary
          data-test="createTenderBid"
          icon="circle add"
          loading={loading}
          content={<Trans i18nKey="tender.overview.add" />}
          onClick={createTender}
        />
      )}
    </>
  );
};

export default TenderOverviewFooter;
