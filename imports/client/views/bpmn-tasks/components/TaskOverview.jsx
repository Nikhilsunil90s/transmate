/* eslint-disable no-use-before-define */
import moment from "moment";
import { toast } from "react-toastify";
import React, { useEffect, useState } from "react";
import { Trans } from "react-i18next";
import { ReactTableWithRowResizer } from "/imports/client/components/tables";
import { useApolloClient } from "@apollo/client";
import TaskTableType from "./TaskTableType";
import TaskTableStatus from "./TaskTableStatus";
import TaskModal from "../modals/TaskModal";
import { GET_TASK_OVERVIEW } from "../queries";

const debug = require("debug")("conversations:overview");

function generateTitle({ type, references, userParams }) {
  if (userParams && userParams.title) {
    return userParams.title;
  }
  if (userParams && userParams.event) {
    // [price-request-requested]
    return <Trans i18nKey={`workflow.task.events.${userParams.event}`} values={userParams} />;
  }
  if (references && references.type) {
    // [priceRequest, tender]
    return <Trans i18nKey={`workflow.task.references.${references.type}`} />;
  }

  // [approval, task ]
  return <Trans i18nKey={`workflow.task.types.${type}`} />;
}

const ConversationsOverview = props => {
  const client = useApolloClient();
  const filters = props.selector;
  const [documents, setDocuments] = useState([]);
  const [isLoadingDocuments, setLoadingDocuments] = useState(false);
  const [modalState, setModalState] = useState({ show: false });
  const showModal = show => setModalState({ ...modalState, show });

  useEffect(() => {
    setLoadingDocuments(true);

    getDocuments({ filters, client }, (error, result) => {
      if (error) {
        toast.error(error.message);
        return;
      }
      debug("results from query %o", result);
      const refinedPriceList = prepareView(result);
      setDocuments(refinedPriceList);

      setLoadingDocuments(false);
    });
  }, []);

  const columns = [
    {
      Header: "Type",
      accessor: "taskType",
      Cell: ({ row: { original } }) => <TaskTableType type={original.taskType} />
    },
    {
      Header: "Created",
      accessor: "createdAt"
    },
    {
      Header: "Due in",
      accessor: "dueBy"
    },
    {
      Header: "Status",
      accessor: "finished",
      Cell: ({ row: { original } }) => <TaskTableStatus finished={original.finished} />
    }
  ];

  function handleClicked(selectedRow) {
    if (!selectedRow) return;
    setModalState({ taskId: selectedRow._id, task: selectedRow, show: true });
  }

  return (
    <div>
      <ReactTableWithRowResizer
        paginate
        shouldShowFooterPagination
        isLoading={isLoadingDocuments}
        columns={columns}
        data={documents}
        onRowClicked={handleClicked}
      />
      <TaskModal {...modalState} showModal={showModal} />
    </div>
  );
};

async function getDocuments({ filters = {}, client }, callback) {
  const { errors, data } = await client.query({
    query: GET_TASK_OVERVIEW,
    variables: { filters },
    fetchPolicy: "no-cache"
  });
  callback(errors?.[0], data?.tasks);
}

/*
  icon: ICON_MAP[item.taskType],
  type: item.taskType,
  dueDate: item.userParams.dueDate,
  references: item.references,
  userParams: item.userParams,
  active: item.referenceActive

*/

function prepareView(docs = []) {
  return docs.map(doc => ({
    ...doc,
    title: generateTitle(doc),
    createdAt: doc.created && moment(doc.created.at).fromNow(),
    dueBy: doc.userParams && moment(doc.userParams.dueBy).fromNow()
  }));
}

export default ConversationsOverview;
