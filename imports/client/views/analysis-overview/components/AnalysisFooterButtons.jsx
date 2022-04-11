import React, { useContext, useState } from "react";
import { Button } from "semantic-ui-react";
import { Trans } from "react-i18next";
import LoginContext from "/imports/client/context/loginContext";

import AnalysisNewModal from "./NewModal";

const debug = require("debug")("address:overview");

const REQUIRED_ACCOUNT_FEATURE = "price-analysis";

const CreateAnalysisButton = () => {
  const { account } = useContext(LoginContext);
  const [show, showModal] = useState(false);
  const canCreateAnalysis = account.hasFeature(REQUIRED_ACCOUNT_FEATURE);

  debug("can create analysis: %s", canCreateAnalysis);

  return (
    <>
      <Button
        primary
        icon="circle add" // disabled={!canCreateAnalysis}
        content={<Trans i18nKey="analysis.button.new" />}
        onClick={() => showModal(true)}
        data-test="createAnalysis"
      />
      <AnalysisNewModal {...{ show, showModal }} />
    </>
  );
};

export default CreateAnalysisButton;
