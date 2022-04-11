import { toast } from "react-toastify";
import React, { useEffect } from "react";
import moment from "moment";
import PropTypes from "prop-types";
import { useLazyQuery } from "@apollo/client";
import client from "/imports/client/services/apollo/client";
import { Container, Button } from "semantic-ui-react";
import OverviewHeaderBack from "/imports/client/components/tables/components/OverviewHeaderBack.jsx";
import SimpleSchema from "simpl-schema";
import SimpleSchema2Bridge from "uniforms-bridge-simple-schema-2";
import { AutoForm, AutoFields } from "uniforms-semantic";
import { GET_REPORT_DATA } from "./queries";
import { IconSegment } from "../../../components/utilities/IconSegment";
import { DateField } from "/imports/client/components/forms/uniforms";

import { loadExcelJS } from "/imports/utils/UI/loadExternalScript";
import { createWorkbook, saveFile } from "/imports/utils/UI/excelJsFn";

const debug = require("debug")("reports");

const PRICE_REQUEST_STATUS_OPTIONS = ["won", "lost", "no bid"];

// const PRICE_REQUEST_ACCOUNT_ROLES = ["bidder", "buyer"];

const PriceRequestFilterForm = new SimpleSchema({
  from: { type: Date, uniforms: { component: DateField } },
  to: { type: Date, uniforms: { component: DateField } },
  bidStatus: {
    type: Array,
    uniforms: {
      label: "Status",
      checkboxes: true,
      options: () => PRICE_REQUEST_STATUS_OPTIONS.map(k => ({ label: k, value: k }))
    }
  },
  "bidStatus.$": { type: String, allowedValues: PRICE_REQUEST_STATUS_OPTIONS }

  // role: { type: String, allowedValues: PRICE_REQUEST_ACCOUNT_ROLES, uniforms: { label: "Role" } }
});

const dataReports = {
  priceRequest: {
    schema: new SimpleSchema2Bridge(PriceRequestFilterForm),
    defaults: {
      from: moment()
        .subtract(3, "months")
        .startOf("day")
        .toDate(),
      to: moment()
        .add(1, "day")
        .startOf("day")
        .toDate(),
      bidStatus: PRICE_REQUEST_STATUS_OPTIONS

      // role: AllAccounts.getType() === "carrier" ? "bidder" : "buyer"
    },
    back: "priceRequests"
  }
};

// set the columnKeys based on the first 10 rows:
const buildColumns = data => {
  const columnKeys = [];
  data.slice(0, 10).forEach(row => {
    let previousKeyIndex = -1;
    Object.keys(row).forEach(k => {
      const keyIndex = columnKeys.findIndex(el => el === k);
      if (keyIndex === -1) {
        previousKeyIndex += 1;
        columnKeys.splice(previousKeyIndex, 0, k);
      } else {
        previousKeyIndex = keyIndex;
      }
    });
  });
  return columnKeys;
};

let formRef;
const ExportData = ({ topic }) => {
  useEffect(() => loadExcelJS(), []);
  const directive = dataReports[topic];
  const [getData, { loading, error }] = useLazyQuery(GET_REPORT_DATA, {
    client,
    onCompleted: res => {
      debug("GET_REPORT_DATA result %o", res);
      const result = res.data?.result || [];

      if (result.length) {
        // scan first 10 rows to get the columns
        const columnKeys = buildColumns(result);

        const wb = createWorkbook();

        const ws = wb.addWorksheet("data", {
          views: [{ showGridLines: false, state: "frozen", ySplit: 1 }]
        });

        ws.columns = columnKeys.map(key => ({ header: key, key }));

        // adding data:
        ws.addRows(result);
        debug(wb);
        saveFile({ wb });
      } else {
        toast.error("No data returned from your query");
      }
    }
  });

  if (error) console.error(error);

  const submitForm = async query => {
    getData({ variables: { input: { topic, query } } });
  };
  if (!directive) return null;

  return (
    <>
      <OverviewHeaderBack redirectTo={directive.back} />
      <Container fluid>
        <IconSegment
          name="download"
          title="Download"
          body={
            loading ? (
              <p>Loading....</p>
            ) : (
              <AutoForm
                schema={directive.schema}
                model={directive.defaults}
                onSubmit={submitForm}
                ref={ref => {
                  formRef = ref;
                }}
              >
                <AutoFields />
              </AutoForm>
            )
          }
          footer={
            <Button primary loading={loading} content="Download" onClick={() => formRef.submit()} />
          }
        />
      </Container>
    </>
  );
};

ExportData.propTypes = {
  topic: PropTypes.string
};

export default ExportData;
