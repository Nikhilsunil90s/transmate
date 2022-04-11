import React from "react";
import { useTranslation } from "react-i18next";
import { Message } from "semantic-ui-react";
import { checkForErrors } from "../../utils/checkForDataErrors";

const ErrorSummary = ({ shipment }) => {
  const { t } = useTranslation();
  const errorChecks = checkForErrors(shipment);
  return Object.values(errorChecks).some(a => a) ? (
    <Message
      error
      header="Potential data issues"
      list={Object.entries(errorChecks)
        .filter(([, v]) => v)
        .map(([k]) => t(`picking.errors.${k}`))}
    />
  ) : null;
};

export default ErrorSummary;
