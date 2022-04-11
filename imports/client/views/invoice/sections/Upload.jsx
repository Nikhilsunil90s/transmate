import { toast } from "react-toastify";
import React, { useState } from "react";
import { useApolloClient, useMutation } from "@apollo/client";
import { Trans } from "react-i18next";
import { Button, Segment, Grid, Message, List } from "semantic-ui-react";
import get from "lodash.get";

import { IconSegment } from "/imports/client/components/utilities/IconSegment";
import { FileUpload } from "/imports/client/components/forms/input/FileUpload.jsx";

import { parseDataFile, ALLOWED_FILE_TYPES } from "/imports/utils/functions/fnParseDataFile";
import DataImportOverview from "/imports/client/views/dataImport/components/DataImportLoader.jsx";

import { START_DATA_IMPORT } from "/imports/api/imports/apollo-dataImports/queries";
import { UPDATE_INVOICE } from "../utils/queries";

const debug = require("debug")("invoice:upload");

/**
 * the file upload section checks if the invoice has an importId key
 * > if importId -> show imported items overview (and errors)
 * > if !importId -> show the file upload section
 * ...
 * parsing:
 * > file is parsed and sent to the data imports method that sets up the job
 * > job is inserting invoice items
 */

const PARSER_OPTIONS = {
  transform: {
    shipmentId: "shipment.number", // maps to shipment.number
    shipperReference: "shipment.shipperRef", // maps to references
    carrierReference: "shipment.carrierRef", // mapts to references
    amountInOrgCurrency: "costs.0.amount.value",
    orgCurrency: "costs.0.amount.currency",
    amountInInvoiceCurrency: "costs.0.amount.convValue",
    exchangeRate: "costs.0.amount.rate",
    exchangeDate: "costs.0.amount.currencyDate",
    costDescription: "costs.0.description",
    costCode: "costs.0.code",
    costsCostId: "costs.0.costId"
  }
};

const FileUploadSection = ({ ...props }) => {
  const [updateInvoice] = useMutation(UPDATE_INVOICE);
  const client = useApolloClient();
  const [file, setFile] = useState();
  const [isParsing, setParsing] = useState(false);
  const [importId, setImportId] = useState(get(props, ["invoice", "importId"]));

  function parseFile() {
    if (!file) return toast.error("Please select a file.");
    if (!ALLOWED_FILE_TYPES.includes(file.type)) return toast.error("Please select a csv file.");
    setParsing(true);

    const { invoiceId } = props;

    const onCompleteCb = async data => {
      try {
        const { data: res, errors } = await client.mutate({
          mutation: START_DATA_IMPORT,
          variables: { input: { data, type: "invoice", references: { invoiceId } } }
        });
        if (errors) throw errors;
        if (!res.startDataImport) throw new Error("No importId received");
        setImportId(res.startDataImport);

        debug("importId %s", res.startDataImport);

        updateInvoice({
          variables: {
            input: {
              invoiceId,
              update: {
                importId: res.startDataImport,
                hasUpload: true
              }
            }
          }
        });
      } catch (error) {
        console.error({ error });
        setParsing(false);
        toast.error("Unable to import data");
      }
    };
    return parseDataFile({ file, onCompleteCb, options: PARSER_OPTIONS });
  }

  return (
    <>
      <IconSegment
        icon="upload"
        title={<Trans i18nKey="partner.billing.invoice.details.modal.title" />}
        body={
          <Grid columns={2}>
            <Grid.Row>
              <Grid.Column>
                {isParsing ? (
                  <p>
                    <Trans i18nKey="partner.billing.invoice.details.modal.saving" />
                  </p>
                ) : (
                  <FileUpload onChange={selectedFile => setFile(selectedFile)} />
                )}
              </Grid.Column>
              <Grid.Column>
                <Message info>
                  <Message info>
                    <Message.Header
                      content={<Trans i18nKey="partner.billing.invoice.import.info_title" />}
                    />
                    <p>
                      <Trans i18nKey="partner.billing.invoice.import.info_body" />
                    </p>
                    <List bulleted>
                      <List.Item>
                        <a href="https://files.transmate.eu/support/invoice-details-sample.csv">
                          <Trans i18nKey="partner.billing.invoice.import.info_options.file" />
                        </a>
                      </List.Item>
                    </List>
                    <p>
                      <Trans i18nKey="partner.billing.invoice.import.info_body2" />
                    </p>
                  </Message>
                </Message>
              </Grid.Column>
            </Grid.Row>
          </Grid>
        }
        footer={<Button primary content="submit" disabled={isParsing} onClick={parseFile} />}
      />
      {importId && (
        <Segment padded="very">
          <DataImportOverview selector={{ importId }} />
        </Segment>
      )}
    </>
  );
};

export default FileUploadSection;
