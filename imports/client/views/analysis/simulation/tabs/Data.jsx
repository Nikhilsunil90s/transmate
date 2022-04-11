import { toast } from "react-toastify";
import React from "react";
import { Trans } from "react-i18next";
import { Segment, Message } from "semantic-ui-react";
import { useApolloClient } from "@apollo/client";
import ScopeData from "/imports/client/components/forms/scopeData/Data.jsx";

import { SIMULATION_SAVE_DETAIL } from "../utils/queries";

const debug = require("debug")("analysis:simulation");

const DataTabNoStructure = () => (
  <Message
    info
    icon="exclamation"
    content={<Trans i18nKey="analysis.simulation.noScopeStructure" />}
  />
);

const DataTab = ({ ...props }) => {
  const client = useApolloClient();
  const { analysisId, simulation, onSave, security } = props;
  const { canEdit } = security;

  const saveScope = (update, cb) => {
    const scopeUpdate = {};
    Object.entries(update).forEach(([k, v]) => {
      scopeUpdate[`scope.${k}`] = v;
    });
    debug({ scopeUpdate, cb });
    onSave(scopeUpdate, cb);
  };

  const onSaveDetail = updates => {
    debug({ analysisId, updates }); // [{rowData, update}]
    client
      .mutate({ mutation: SIMULATION_SAVE_DETAIL, variables: { analysisId, updates } })
      .then(({ errors }) => {
        if (errors) throw errors;
        toast.success("items saved");
      })
      .catch(err => {
        console.error(err);
        toast.error("item not saved");
      });
  };
  const onGenerateData = () => {};

  const hasDataStructure = simulation.scope?.lanes?.length > 0;
  const isGeneratingScope = simulation.activity?.generateScope;

  return (
    <Segment padded="very" className="dataSegment">
      {!hasDataStructure && <DataTabNoStructure />}
      {hasDataStructure && isGeneratingScope && (
        <div className="ui active inverted dimmer">
          <div className="ui text loader">Loading</div>
        </div>
      )}
      {hasDataStructure && !isGeneratingScope && (
        <ScopeData
          type="simulation"
          documentId={analysisId}
          documentType="simulation"
          source={simulation.scope?.source}
          onSaveHeader={saveScope}
          onSaveBulk={onSaveDetail}
          afterGenerateData={onGenerateData}
          canEdit={canEdit}
        />
      )}
    </Segment>
  );
};

export default DataTab;
