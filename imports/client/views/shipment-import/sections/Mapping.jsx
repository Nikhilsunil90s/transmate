import React from "react";
import { Trans } from "react-i18next";
import { useMutation } from "@apollo/client";
import { Header, Segment } from "semantic-ui-react";
import ImportMappingForm from "./mapping/ImportMappingForm";
import { INITIALIZE_MAPPING } from "../utils/queries";
import { tabPropTypes } from "../utils/propTypes";

const debug = require("debug")("shipment-import");

const MappingLoadingPlaceholder = () => {
  return (
    <>
      <Segment as="form" padded="very" basic>
        <Header as="h3" content={<Trans i18nKey="edi.mapping.title" />} />
        <div className="row header margin">
          <div className="col s12">
            <Trans i18nKey="edi.steps.mapping.lookup_loading" />
          </div>
        </div>
      </Segment>
      <Segment as="footer" />
    </>
  );
};

const ImportMapping = ({ ...props }) => {
  const { importId, imp } = props;
  const [initializeMapping, { loading, error }] = useMutation(INITIALIZE_MAPPING, {
    variables: { input: { importId } }
  });
  if (!imp.mapping) initializeMapping();
  debug("apollo mapping data", { loading, error });
  if (loading) return <MappingLoadingPlaceholder />;

  return <ImportMappingForm {...props} resetMapping={initializeMapping} />;
};

ImportMapping.propTypes = tabPropTypes;

export default ImportMapping;
