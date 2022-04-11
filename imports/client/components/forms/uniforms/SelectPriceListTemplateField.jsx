import React from "react";
import { gql, useQuery } from "@apollo/client";
import { connectField } from "uniforms";
import { SelectField } from "./SelectField";

const debug = require("debug")("entities");

const GET_TEMPLATES = gql`
  query getPriceListTemplates {
    templates: getPriceListTemplates {
      id
      title
    }
  }
`;

const PriceListTemplateFieldLoader = ({ label, ...props }) => {
  const { data, loading, error } = useQuery(GET_TEMPLATES);
  debug("entities data %o", { data, loading, error });
  const templates = data?.templates || [];

  return (
    <SelectField
      {...props}
      label={label}
      loading={loading}
      search
      selection
      options={templates.map(({ id, title }) => ({
        key: id,
        text: (
          <>
            {title} <span style={{ opacity: 0.5 }}>{id}</span>
          </>
        ),
        value: id
      }))}
    />
  );
};

export default connectField(PriceListTemplateFieldLoader);
