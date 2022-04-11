import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { Trans } from "react-i18next";
import { useApolloClient, useQuery } from "@apollo/client";
import { Button, Tab, Segment, Menu, Label } from "semantic-ui-react";
import { ConfirmComponent } from "/imports/client/components/modals";
import ShipmentImportOverview from "./process/ProcessOverview";
import { GET_IMPORT_ROWS, CANCEL_IMPORT, REVERT_IMPORT } from "../utils/queries";
import { tabPropTypes } from "../utils/propTypes";

const debug = require("debug")("shipment-import");

let isPolling;
const ImportProcess = ({ importId, imp }) => {
  const client = useApolloClient();
  const [showCancel, showConfirmCancel] = useState(false);
  const [showRevert, showConfirmRevert] = useState(false);
  const canBeCanceled = imp?.progress?.process < 100;
  const canBeReverted = imp?.progress?.jobs > 0;

  const { data = {}, loading, error, startPolling, stopPolling } = useQuery(GET_IMPORT_ROWS, {
    variables: { importId },
    fetchPolicy: "no-cache"
  });
  debug("rowData %o", { data, error });
  if (error) console.error({ error });

  useEffect(() => {
    if (imp?.progress?.jobs < 100 || !isPolling) {
      debug("start polling");
      startPolling(500);
      isPolling = true;
    }
    if (imp?.progress?.process === 100 && isPolling) {
      debug("stop polling");
      stopPolling();
    }
  }, [imp.progress]);

  const rows = data.imp?.rows || [];

  async function cancelImport() {
    try {
      const { errors } = await client.mutate({ mutation: CANCEL_IMPORT, variables: { importId } });
      if (errors) throw errors;
      toast.success("Import cancelled");
      showConfirmCancel(true);
    } catch (errors) {
      console.error({ errors });
      toast.error("Could not cancel import");
    }
  }

  async function revertImport() {
    try {
      const { errors } = await client.mutate({ mutation: REVERT_IMPORT, variables: { importId } });
      if (errors) throw errors;
      toast.success("Import cancelled");
      showConfirmRevert(false);
    } catch (errors) {
      console.error({ errors });
      toast.error("Could not cancel import");
    }
  }

  const successItems = rows.filter(({ status }) => status !== "failed");
  const failedItems = rows.filter(({ status }) => status === "failed");

  return (
    <>
      <div>
        <Tab
          menu={{ pointing: true }}
          panes={[
            {
              menuItem: (
                <Menu.Item key="results">
                  Results
                  {!loading && (
                    <Label color="teal" floating>
                      {successItems.length}
                    </Label>
                  )}
                </Menu.Item>
              ),
              render: () => (
                <Tab.Pane>
                  <ShipmentImportOverview loading={loading} rows={successItems} />
                </Tab.Pane>
              )
            },
            {
              menuItem: (
                <Menu.Item key="errors">
                  Errors
                  {!loading && (
                    <Label floating color="red">
                      {failedItems.length}
                    </Label>
                  )}
                </Menu.Item>
              ),
              render: () => (
                <Tab.Pane>
                  <ShipmentImportOverview loading={loading} rows={failedItems} />
                </Tab.Pane>
              )
            }
          ]}
        />
      </div>

      <Segment as="footer">
        <div>
          {canBeCanceled && (
            <Button
              basic
              color="red"
              content={<Trans i18nKey="edi.cancel" />}
              onClick={() => showConfirmCancel(true)}
            />
          )}
          <ConfirmComponent
            show={showCancel}
            showConfirm={showConfirmCancel}
            content="Are you sure you want to cancel?"
            onConfirm={cancelImport}
          />

          {canBeReverted && (
            <Button
              basic
              color="red"
              className="revert"
              content={<Trans i18nKey="edi.revert" />}
              onClick={() => showConfirmRevert(true)}
            />
          )}
          <ConfirmComponent
            show={showRevert}
            showConfirm={showConfirmCancel}
            content="Are you sure you want to revert this import? This will delete all the shipments, stages and items from the database, and cannot be undone."
            onConfirm={revertImport}
          />
        </div>
      </Segment>
    </>
  );
};

ImportProcess.propTypes = tabPropTypes;

export default ImportProcess;
