/* eslint-disable no-use-before-define */
import moment from "moment";
import React, { useState } from "react";
import { Trans } from "react-i18next";
import { useQuery } from "@apollo/client";
import { ReactTable } from "/imports/client/components/tables";
import WorkflowTableActions from "./tableActions";
import Footer from "./Footer";
import { ConfirmComponent } from "/imports/client/components/modals";
import { GET_WORKFLOWS } from "../utils/queries";

const debug = require("debug")("workflows:overview");

const WorkflowsOverview = ({ showFooter, workflows, loading }) => {
  const [confirmState, setConfirmState] = useState({ show: false });
  const showConfirm = show => setConfirmState({ ...confirmState, show });

  function promptForDelete(workflowId) {
    // TODO [$6130a08837762e00094fd3dc]: delete workflow
    debug("deleting workflow", workflowId);
  }

  const columns = [
    {
      Header: "Name",
      accessor: "name"
    },
    {
      Header: "Created",
      accessor: "createdAt"
    },
    {
      Header: "Status",
      accessor: "status"
    },
    {
      Header: "Actions",
      accessor: "_id",
      Cell: ({ row: { original } }) => (
        <WorkflowTableActions workflowId={original.id} onDelete={promptForDelete} />
      )
    }
  ];

  return (
    <div>
      <ReactTable
        paginate
        shouldShowFooterPagination={showFooter}
        isLoading={loading}
        columns={columns}
        data={workflows}
        paginationContent={<Footer />}
      />
      <ConfirmComponent
        show={confirmState.show}
        showConfirm={showConfirm}
        content={<Trans i18nKey="workflow.remove_confirm" />}
        onConfirm={() => {}}
      />
    </div>
  );
};

const WorkflowsOverviewLoader = props => {
  const { query } = props;
  const { data, loading, error } = useQuery(GET_WORKFLOWS, { variables: { input: { query } } });
  debug("workflow data %o", { data, loading, error });
  const workflows = (data?.workflows || []).map(doc => ({
    ...doc,
    createdAt: doc.created && moment(doc.created.at).fromNow()
  }));

  return <WorkflowsOverview {...props} workflows={workflows} loading={loading} />;
};

export default WorkflowsOverviewLoader;
