import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";

import { useApolloClient, useQuery } from "@apollo/client";
import Loader from "/imports/client/components/utilities/Loader.jsx";
import { GET_IMPORT_DOC } from "./utils/queries";
import { getTemplate } from "./utils/getTemplate";

import { ImportFile, ImportMapping, ImportWait, ImportProcess } from "./sections";
import useRoute from "../../router/useRoute";
import { markNotificationsRead } from "/imports/utils/UI/markNotificationsRead";

const debug = require("debug")("shipment-import");

const DynamicSection = ({ ...props }) => {
  const { imp } = props;
  const [activeStep, setActiveStep] = useState(getTemplate(imp));
  const allProps = { ...props, setActiveStep };

  useEffect(() => setActiveStep(getTemplate(imp)), [imp.progress, imp.totall]);
  debug("active step %s", activeStep);

  if (!imp.id) return <div>Not Found </div>;
  return (
    <>
      {activeStep === "ImportFile" && <ImportFile {...allProps} />}
      {activeStep === "ImportMapping" && <ImportMapping {...allProps} />}
      {activeStep === "ImportWait" && <ImportWait {...allProps} />}
      {activeStep === "ImportProcess" && <ImportProcess {...allProps} />}
    </>
  );
};

// flow:
// 0. [UI] select a file
// 1. file is uploaded & rows stored in the database
// 3. [UI] mapping page -> fields/values are mapped (and stored in db)

const Import = ({ importId }) => {
  const client = useApolloClient();
  useEffect(() => markNotificationsRead("import", ["done", "failed"], { importId }, client), [
    importId
  ]);

  const { data = {}, loading, error } = useQuery(GET_IMPORT_DOC, { variables: { importId } });
  debug("apollo data import %o", { importId, data, loading, error });
  if (error) console.error({ error });

  const imp = data.imp || {};

  return loading ? <Loader loading /> : <DynamicSection {...{ importId, imp }} />;
};

const ImportPage = () => {
  const { goRoute, params } = useRoute();
  const importId = params._id;
  debug("loading page for %s", importId);

  if (!importId) {
    toast.error("Could not start shipment import.");
    goRoute("shipmentOverview");
  }

  return <Import importId={importId} />;
};

export default ImportPage;
