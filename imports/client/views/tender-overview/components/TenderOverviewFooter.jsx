import React, { useContext } from "react";
import { useApolloClient } from "@apollo/client";
import { Button, Icon } from "semantic-ui-react";
import { Trans, useTranslation } from "react-i18next";

import LoginContext from "/imports/client/context/loginContext";
import { createTender } from "../utils/creatTenderFn";
import useRoute from "/imports/client/router/useRoute";

const debug = require("debug")("tender:overview");

const REQUIRED_ACCOUNT_FEATURE = "tender";

const CreateTenderButton = () => {
  const { goRoute } = useRoute();
  const { t } = useTranslation();
  const client = useApolloClient();
  const { userId, account } = useContext(LoginContext);

  const canCreateTender = account.hasFeature(REQUIRED_ACCOUNT_FEATURE);

  debug("can create tender: %s", canCreateTender);

  function createNewTender() {
    createTender({ userId, client, t, goRoute });
  }

  return (
    <>
      {canCreateTender && (
        <Button primary data-test="createTender" onClick={createNewTender}>
          <Icon name="circle add" />
          <Trans i18nKey="tender.overview.add" />
        </Button>
      )}
    </>
  );
};

const TenderOverviewFooter = () => {
  return <CreateTenderButton />;
};

export default TenderOverviewFooter;
