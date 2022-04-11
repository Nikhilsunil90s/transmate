import React from "react";
import { useQuery } from "@apollo/client";
import { useTranslation } from "react-i18next";
import gql from "graphql-tag";
import ItemHeader from "../ItemHeader.jsx";
import useRoute from "/imports/client/router/useRoute.js";

const debug = require("debug")("header");

const ANALYSIS_QUERY = gql`
  query getAnalysisForHeader($analysisId: String!) {
    analysis: getAnalysis(analysisId: $analysisId) {
      id
      name
      type
    }
  }
`;

const AnalysisHeader = () => {
  const { t } = useTranslation();
  const {
    params: { _id: analysisId }
  } = useRoute();

  const { data = {}, loading, error } = useQuery(ANALYSIS_QUERY, {
    variables: { analysisId }
  });

  debug("header query %o", { data, loading, error });

  const analysis = data.analysis || {};
  return (
    <ItemHeader>
      <div>
        {!loading && t(`analysis.${analysis.type}.header.item`)} <b>{analysis.name || null}</b>
      </div>
    </ItemHeader>
  );
};

export default AnalysisHeader;
