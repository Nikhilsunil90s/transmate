import React from "react";
import { Trans } from "react-i18next";
import { Label } from "semantic-ui-react";

const LabelsTag = ({ value = [], emptyMsg = <Trans i18nKey="form.empty" /> }) => {
  const hasValues = value.length > 0;
  return hasValues ? (
    <div>
      {value.map((item, i) => (
        <Label key={i} content={item} />
      ))}
    </div>
  ) : (
    <p>{emptyMsg}</p>
  );
};

export default LabelsTag;
