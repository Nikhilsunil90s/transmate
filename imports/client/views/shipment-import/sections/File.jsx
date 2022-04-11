import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import Papa from "papaparse";

import { useApolloClient } from "@apollo/client";
import { Trans, useTranslation } from "react-i18next";
import { Image, Form, Header, Segment, Button } from "semantic-ui-react";
import { FileUpload } from "/imports/client/components/forms/input/FileUpload.jsx";
import { INSERT_ROW, FLAG_IMPORT_DONE } from "../utils/queries";
import { arraydiff } from "/imports/utils/functions/fnArrayHelpers.js";
import { tabPropTypes } from "../utils/propTypes";
import useRoute from "/imports/client/router/useRoute";

const debug = require("debug")("shipment-import");

function findDuplicates(arr) {
  return arr.filter((item, index) => arr.indexOf(item) !== index);
}

let items = 0;
let itemReturned = 0;

const ImportFile = ({ ...props }) => {
  const { t } = useTranslation();
  const client = useApolloClient();
  const [isProcessing, setProcessing] = useState(false);
  const [allComplete, setAllComplete] = useState(false);
  const { importId } = props;
  const { goRoute } = useRoute();

  async function parseFile(file) {
    setProcessing(true);

    // Parse header row to check for duplicate headers
    const duplicates = await new Promise((resolve, reject) => {
      return Papa.parse(file, {
        skipEmptyLines: true,
        header: true,
        step: (row, parser) => {
          const firstRow = row.data || {};
          const headers = Object.keys(firstRow);
          const duplicatesArr = findDuplicates(headers);

          parser.abort();
          return resolve(duplicatesArr);
        },
        error(e) {
          reject(e);
        }
      });
    });
    if (duplicates.length) {
      setProcessing(false);
      toast.error(`<b>Error: duplicate headers</b> (${duplicates.join(", ")})`);
      return;
    }

    // Check for non-US format numbers
    const numbers = await new Promise((resolve, reject) => {
      const numbersArr = [];
      return Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        step: row => {
          return Object.entries(row.data || {}).forEach(([header, value]) => {
            if (value && !Number.isNaN(value.replace(/[.,]*/g, ""))) {
              if (value.match(/,/)) {
                numbersArr.push(header);
              }
            }
          });
        },
        error(e) {
          reject(e);
        },
        complete() {
          return resolve(numbersArr);
        }
      });
    });
    if (numbers.length) {
      toast.error({
        autoClose: false,
        render: (
          <>
            <b>Error: ambiguous number format</b>
            <br />
            Numbers should be in US format, without thousands separator (example 1234.56).
            <br />
            <br />
            Headers: {numbers.join(", ")}
          </>
        )
      });
    }

    let headers = [];
    let progress = 0;
    let i = 0;
    Papa.parse(file, {
      header: true,
      transformHeader(h) {
        return h.trim();
      },
      skipEmptyLines: true,
      transform(val) {
        // trim whitespace:
        return val.trim();
      },
      step(row) {
        items += 1;
        let updateMapping = false;
        let updateProgress = false;
        const percent = Math.ceil((row.meta.cursor / file.size) * 100);
        if (percent > progress) {
          progress = percent;
          updateProgress = true;
        }

        if (arraydiff({ masterArr: headers, subsetArr: row.meta.fields }).length) {
          headers = [...new Set([...headers, ...row.meta.fields])];
          updateMapping = true;
          debug("update headers %o, headers : %o", updateMapping, headers);
        }

        i += 1;
        client
          .mutate({
            mutation: INSERT_ROW,
            variables: {
              input: {
                importId,
                i,
                data: row.data,
                headers: updateMapping ? headers : null,
                progress: updateProgress ? progress : null
              }
            }
          })
          .then(() => {
            // we use a separate useEffect to make sure the db update is done for the last uploaded item
            // prior to running the flagComplete script
            itemReturned += 1;
            if (items === itemReturned) {
              setAllComplete(true);
            }
          });
      }
    });
  }

  useEffect(() => {
    if (allComplete) {
      debug("upload comlete");
      client.mutate({
        mutation: FLAG_IMPORT_DONE,
        variables: { importId }
      });
    }
  }, [allComplete, importId, client]);

  return (
    <>
      <div>
        <Form className="file">
          <Image className="analyses" src="/images/img-analyses.png" height="400" />
          <Header as="h1" content={<Trans i18nKey="edi.steps.import.description" />} />
          {isProcessing ? (
            <p>Processing...</p>
          ) : (
            <FileUpload
              label={t("edi.steps.import.button")}
              onChange={parseFile}
              accept=".csv, text/csv"
            />
          )}
        </Form>
      </div>
      <Segment as="footer">
        <div>
          <Button basic primary content="Abort" onClick={() => goRoute("shipments")} />
        </div>
      </Segment>
    </>
  );
};

ImportFile.propTypes = tabPropTypes;

export default ImportFile;
