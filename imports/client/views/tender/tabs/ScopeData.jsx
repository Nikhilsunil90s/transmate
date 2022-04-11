import React, { useMemo } from "react";
import ScopeData from "/imports/client/components/forms/scopeData/Data.jsx";

const ScopeDataTab = ({ ...props }) => {
  const { tender, security, onSaveDetails } = props;
  const { canEditScope } = security;

  const scopeData = useMemo(
    () => (
      <ScopeData
        type="tender"
        documentId={tender.id}
        onSaveBulk={onSaveDetails}
        canEdit={canEditScope}
        query={tender?.params?.query}
      />
    ),
    []
  );
  return (
    <div>
      <section className="ui very padded attached segments">{scopeData}</section>
    </div>
  );
};

export default ScopeDataTab;
