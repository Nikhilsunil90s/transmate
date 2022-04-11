import React from "react";
import { Trans } from "react-i18next";
import { Segment, Button } from "semantic-ui-react";
import { generateRoutePath } from "/imports/client/router/routes-helpers";

const DataImportFooter = ({ imp }) => {
  const path = imp.type === "partners" ? "partners" : "addresses";
  const canBeCanceled = false;
  const canBeReverted = false;
  return (
    <Segment as="footer">
      <div>
        <Button
          as="a"
          primary
          icon="left arrow"
          content={<Trans i18nKey="form.back" />}
          href={generateRoutePath(path)}
        />

        {canBeCanceled && <Button basic color="red" content={<Trans i18nKey="edi.cancel" />} />}
        {canBeReverted && <Button basic color="red" content={<Trans i18nKey="edi.revert" />} />}
      </div>
    </Segment>
  );
};

export default DataImportFooter;
