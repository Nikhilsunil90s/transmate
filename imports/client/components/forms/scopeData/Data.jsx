import { toast } from "react-toastify";
import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { useQuery, useApolloClient } from "@apollo/client";
import PropTypes from "prop-types";
import { Button, Popup, Segment } from "semantic-ui-react";
import { AnalysisGrid } from "../../AnalysisGrid/AnalysisGrid";
import QueryModal from "./modals/Query.jsx";
import { ConfirmComponent } from "/imports/client/components/modals";
import { scopePropTypes } from "./utils/propTypes";

import {
  GET_SCOPE_DETAIL,
  SCOPE_DATA_FROM_SOURCE,
  SCOPE_GENERATE_DATA_FILL,
  SCOPE_SHIP_QUERY
} from "./utils/queries";

const debug = require("debug")("scope:data");

//#region components
const GRID_SETTINGS = {
  autoRowSize: true,
  autoColumnSize: true,
  stretchH: "all",
  other: {
    colWidths: 100,
    rowHeaderWidth: 250
  }
};

const GRID_COLUMNS = [
  {
    data: "name",
    editor: false
  },
  {
    data: "quantity.count",
    type: "numeric",
    editor: "numeric"
  },
  {
    data: "quantity.amount",
    type: "numeric",
    editor: "numeric"
  },
  {
    data: "quantity.leadTime",
    type: "numeric",
    editor: "numeric"
  },
  {
    data: "quantity.currentCost",
    type: "numeric",
    editor: "numeric"
  }
];

const GRID_HEADERS = [
  "Scope group",
  "# shipments",
  "Tot. quantity",
  "leadtime (hr)",
  "benchmark cost"
];

const ScopeData = ({ scopeData, loading, refetchScope, ...props }) => {
  const client = useApolloClient();
  const { t } = useTranslation();
  const [showQueryM, setShowQueryM] = useState(false);
  const [confirmState, setConfirmState] = useState({ show: false });
  const showConfirm = show => setConfirmState({ ...confirmState, show });
  const { calculation, documentId, type, canEdit, query, onSave, saveBulk } = props;

  // eslint-disable-next-line consistent-return
  async function onSubmitQueryForm(newQuery) {
    setShowQueryM(false);
    try {
      const { errors } = await client.query({
        query: SCOPE_SHIP_QUERY,
        variables: {
          input: {
            masterId: documentId,
            masterType: type,
            query: newQuery
          }
        },
        fetchPolicy: "no-cache"
      });

      // saves the update, runs the query, stores the data
      if (errors && errors.length) throw errors[0];
      toast.success("Scope groups are being populated...");
      refetchScope();
      return setShowQueryM(false);
    } catch (err) {
      toast.error(err.message);
    }
  }

  function generateFromRandomData() {
    setConfirmState({
      show: true,
      onConfirm: async () => {
        toast.info("Copying your scope data");

        try {
          const { errors } = await client.mutate({
            mutation: SCOPE_GENERATE_DATA_FILL,
            variables: {
              input: {
                masterId: documentId,
                masterType: type
              }
            }
          });
          if (errors && errors.length) throw errors[0];
          refetchScope();
          showConfirm(false);
        } catch (err) {
          toast.error(err.message);
        }
      },
      content: t("scope.data.generate_confirm")
    });
  }

  function generateFromSourceData() {
    setConfirmState({
      show: true,
      onConfirm: () => {
        toast.info("Copying your scope data");
        client
          .mutate({
            mutation: SCOPE_DATA_FROM_SOURCE,
            variables: {
              input: {
                masterId: documentId,
                masterType: type
              }
            }
          })
          .then(({ data, errors }) => {
            if (errors) throw errors;
            debug("generateFromSourceData", data);
            refetchScope();
            showConfirm(false);
          })
          .catch(error => {
            console.error(error);
            toast.error("Could not copy data");
          });
      },
      content: t("scope.data.generate_confirm")
    });
  }

  return calculation?.status === "calculating" ? (
    <div className="ui active inverted dimmer">
      <div className="ui text loader">{calculation.message}</div>
    </div>
  ) : (
    <>
      <Segment clearing>
        {canEdit && (
          <Button.Group floated="right" size="small" basic>
            <Popup
              content={t("scope.data.query_btn")}
              position="bottom right"
              trigger={
                <Button
                  icon="truck"
                  onClick={() => {
                    setShowQueryM(true);
                  }}
                />
              }
            />
            <QueryModal
              show={showQueryM}
              showModal={setShowQueryM}
              onSave={onSubmitQueryForm}
              query={query}
            />
            <Popup
              content={t("scope.data.generate_btn")}
              position="bottom right"
              trigger={<Button icon="lightning" onClick={generateFromRandomData} />}
            />
            <Popup
              content={t("scope.data.copy_btn")}
              position="bottom right"
              trigger={<Button icon="paste" onClick={generateFromSourceData} />}
            />
            <ConfirmComponent {...confirmState} showConfirm={showConfirm} />
          </Button.Group>
        )}
      </Segment>
      <div style={{ height: "300px" }}>
        <AnalysisGrid
          loading={loading}
          data={scopeData}
          colH={GRID_HEADERS}
          rowH={false}
          columns={GRID_COLUMNS}
          canEdit={canEdit}
          settings={GRID_SETTINGS}
          onSave={onSave}
          afterChange={saveBulk} // raw handler
        />
      </div>
    </>
  );
};

ScopeData.propTypes = {
  loading: PropTypes.bool,
  scopeData: PropTypes.array,
  refetchScope: PropTypes.func,
  ...scopePropTypes
};
//#endregion

const ScopeDataLoader = ({ ...props }) => {
  const { type, documentId, onSave, onSaveBulk } = props;
  const { data = {}, loading, error, refetch: refetchScope } = useQuery(GET_SCOPE_DETAIL, {
    variables: { input: { type, documentId } },
    fetchPolicy: "no-cache"
  });
  if (error) {
    return null;
  }

  const scopeData = data.scopeDetail || [];
  debug("scope data", scopeData);

  // TODO [#295]: try to fase this one out
  function onSaveDetail(item, update) {
    if (onSave) onSave(item, update);
  }
  function saveBulk(changes) {
    // return value [{rowData, update: {fieldName: value}}
    if (onSaveBulk) onSaveBulk(changes);
  }

  return loading ? (
    "loading ..."
  ) : (
    <ScopeData
      {...props}
      {...{ scopeData, loading, onSave: onSaveDetail, saveBulk, refetchScope }}
    />
  );
};

ScopeDataLoader.propTypes = scopePropTypes;

export default ScopeDataLoader;
