import React, { useContext, useMemo } from "react";
import { useQuery } from "@apollo/client";

import Loader from "/imports/client/components/utilities/Loader.jsx";
import { removeEmpty } from "/imports/utils/functions/fnRemoveNullFromObject";

import { initializeSecurity } from "./utils/security";
import { GET_ANALYSIS } from "./utils/queries";
import Simulation from "./simulation/Simulation";
import SwitchPoint from "./switch-point/SwitchPoint";
import useRoute from "../../router/useRoute";
import LoginContext from "../../context/loginContext";

const debug = require("debug")("analysis:main");

const AnalysisLoader = () => {
  const { accountId, userId } = useContext(LoginContext);
  const { params, queryParams } = useRoute();
  const analysisId = params._id;
  const redirect = useMemo(() => queryParams.redirect, []);

  const { data: fetchData = {}, loading, error, refetch } = useQuery(GET_ANALYSIS, {
    variables: { analysisId },
    fetchPolicy: "cache-and-network"
  });
  if (error) console.error(error);
  debug("analysis data from apollo %o", { fetchData, loading, error });

  if (loading) {
    return <Loader loading text="Loading Analysis" />;
  }

  const analysis = removeEmpty(fetchData.analysis || {});
  const security = initializeSecurity({ analysis, accountId, userId });
  const allProps = { analysisId, analysis, refetch, redirect, security };

  return (
    <>
      {analysis.type === "switchPoint" && <SwitchPoint {...allProps} />}
      {["simulation", "simulation-v2"].includes(analysis.type) && <Simulation {...allProps} />}
      {analysis.type === "custom" && "CustomAnalysis"}
    </>
  );
};

export default AnalysisLoader;
