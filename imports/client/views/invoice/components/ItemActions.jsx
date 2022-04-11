import { toast } from "react-toastify";
import get from "lodash.get";
import React from "react";
import { useApolloClient, useMutation } from "@apollo/client";
import { Segment, Button, Popup } from "semantic-ui-react";

import { dataHandler } from "/imports/utils/UI/helpers/downloadDataHandler";

import { RESET_EXCHANGE_RATES, GET_INVOICE_REPORT } from "../utils/queries";

const ItemActions = ({ invoiceId, toggleFilters, onSelectTab }) => {
  const [resetExhangeRates] = useMutation(RESET_EXCHANGE_RATES, {
    variables: { input: { invoiceId } }
  });
  const client = useApolloClient();

  function resetExchange() {
    resetExhangeRates()
      .then(() => toast.success("Dates reloaded"))
      .catch(error => {
        console.error(error);
        toast.error("Could not reset ");
      });
  }

  function reviewMapping() {
    onSelectTab("mapping");
  }

  function downloadInvoiceData() {
    const toastId = toast.info("Generating your report...", {
      autoClose: false
    });
    client
      .query({
        query: GET_INVOICE_REPORT,
        variables: { query: { invoiceId } },
        fetchPolicy: "no-cache"
      })
      .then(({ data }) => {
        dataHandler(get(data, ["getInvoiceReport", "result"]), toastId);
      })
      .catch(error => {
        console.error(error);
        toast.error("Could not download report");
      });
  }

  return (
    <Segment clearing>
      <Button.Group floated="right">
        <Button icon="download" onClick={downloadInvoiceData} />
        <Popup
          content="Review cost mapping"
          position="bottom right"
          trigger={<Button icon="tasks" onClick={reviewMapping} />}
        />
        <Popup
          content="Recalculate exchange rates in shipment cost accruals."
          position="bottom right"
          trigger={<Button icon="exchange" onClick={resetExchange} />}
        />
        <Popup
          content="Toggle filter invoice data"
          position="bottom right"
          trigger={<Button icon="filter" onClick={toggleFilters} />}
        />
      </Button.Group>
    </Segment>
  );
};

export default ItemActions;
