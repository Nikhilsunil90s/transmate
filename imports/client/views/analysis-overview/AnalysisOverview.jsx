/* eslint-disable no-use-before-define */
import moment from "moment";
import { useQuery } from "@apollo/client";
import React from "react";

import { ReactTableWithRowResizer } from "/imports/client/components/tables";
import { Trans } from "react-i18next";

import AnalysisFooterButtons from "./components/AnalysisFooterButtons";

import { GET_ANALYSES } from "./utils/queries";
import useRoute from "../../router/useRoute";

const debug = require("debug")("analysis:overview");

function prepareView(docs = []) {
  return docs.map(doc => ({
    ...doc,
    type: <Trans i18nKey={`analysis.types.${doc.type}`} />,
    createdAt: moment(doc.created.at).format("LL")
  }));
}

const AnalysisOverview = () => {
  const { goRoute } = useRoute();
  const { data, error, loading } = useQuery(GET_ANALYSES, {
    variables: { viewKey: "DEFAULT" }
  });
  debug("apollo results", { data, error, loading });
  if (error) console.error(`>>>>>>> error`, error);

  const refenedList = prepareView(data?.analyses || []);

  const columns = [
    {
      Header: "Type",
      accessor: "type"
    },
    {
      Header: "Name",
      accessor: "name"
    },
    {
      Header: "Created",
      accessor: "createdAt"
    },
    {
      Header: "Summary",
      accessor: "summary"
    }
  ];

  function handleClicked(selectedRow) {
    debug(selectedRow);
    if (!selectedRow) return;
    goRoute("analysis", { _id: selectedRow.id });
  }

  return (
    <div>
      <ReactTableWithRowResizer
        paginate
        shouldShowFooterPagination
        isLoading={loading}
        paginationContent={<AnalysisFooterButtons />}
        columns={columns}
        data={refenedList}
        onRowClicked={handleClicked}
      />
    </div>
  );
};

export default AnalysisOverview;
