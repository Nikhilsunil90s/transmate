import React from "react";
import { Segment } from "semantic-ui-react";
import ScopeDefinition from "/imports/client/components/forms/scope/Scope.jsx";

const TenderScopeTab = ({ ...props }) => {
  const { onSave, security, tender = {} } = props;
  const canEdit = security.canModifyTenderSettings;

  const saveScope = (update, cb) => {
    const scopeUpdate = {};
    Object.entries(update).forEach(([k, v]) => {
      scopeUpdate[`scope.${k}`] = v;
    });
    onSave(scopeUpdate, cb);
  };
  return (
    <Segment
      padded="very"
      content={
        <ScopeDefinition
          scope={tender.scope}
          masterType="tender"
          masterId={tender.id}
          onSave={saveScope}
          canEdit={canEdit}
        />
      }
    />
  );
};

export default TenderScopeTab;
