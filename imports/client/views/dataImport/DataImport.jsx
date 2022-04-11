import React, { useEffect } from "react";
import { useApolloClient, useQuery } from "@apollo/client";

import { Segment } from "semantic-ui-react";
import DataImportOverview from "./components/DataImportLoader";
import Footer from "./components/Footer";

import { GET_IMPORT } from "./utils/queries";
import useRoute from "../../router/useRoute";
import { markNotificationsRead } from "/imports/utils/UI/markNotificationsRead";

const debug = require("debug")("data-import");

const DataImport = () => {
  const client = useApolloClient();
  const { params } = useRoute();
  const importId = params._id;

  const { data = {}, error } = useQuery(GET_IMPORT, {
    variables: { importId },
    fetchPolicy: "no-cache"
  });
  debug("rowData %o", { data, error });
  if (error) console.error({ error });

  const imp = data.imp || {};

  useEffect(() => {
    markNotificationsRead("import", ["done", "failed"], { importId }, client);
  }, [importId]);

  return (
    <>
      <div>
        <Segment padded="very">
          <DataImportOverview selector={{ importId }} />
        </Segment>
      </div>
      <Footer {...{ imp, importId }} />
    </>
  );
};

export default DataImport;
