import { useQuery } from "@apollo/client";
import moment from "moment";
import { useEffect, useRef } from "react";
import { GET_DATA_IMPORT } from "./queries";

const debug = require("debug")("useEdiJobs");

const prepareView = (docs = []) => {
  return docs.map(doc => ({
    ...doc,
    createdAt: doc.created && moment(doc.created.at).fromNow()
  }));
};

const useEdiJobs = (importId: string) => {
  const isPolling = useRef(false);

  const { data = {}, loading, error, startPolling, stopPolling } = useQuery(
    GET_DATA_IMPORT,
    {
      variables: { importId },
      skip: !importId,
      fetchPolicy: "no-cache"
    }
  );
  debug("rowData %o", { data, error });
  if (error) console.error({ error });

  const imp = data.imp || {};
  const rows = imp?.rows || [];

  useEffect(() => {
    const isProcessing = rows.some(({ status }) =>
      ["waiting", "ready", "running"].includes(status)
    );
    if (isProcessing && !isPolling.current) {
      debug("start polling");
      startPolling(500);
      isPolling.current = true;
    }
    if (!isProcessing && isPolling.current) {
      debug("stop polling");
      stopPolling();
    }
  }, [rows, startPolling, stopPolling]);

  const documents = prepareView(rows);

  return {
    error,
    documents,
    isLoadingDocuments: loading
  };
};

export default useEdiJobs;
