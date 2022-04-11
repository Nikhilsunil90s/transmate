import React from "react";
import { Accordion, Segment } from "semantic-ui-react";
import TenderifyMappingMain from "../mapping/Main";

const TenderifyMappingAccordion = ({ mappings, ...baseProps }) => {
  return (
    <Accordion
      styled
      fluid
      defaultActiveIndex={0}
      panels={mappings.map((mapping, i) => ({
        key: `mappingPanel-${i}`,
        title: `${mapping.name}`,
        content: {
          content: mapping.status?.processing ? (
            <Segment loading />
          ) : (
            <TenderifyMappingMain {...baseProps} mapping={mapping} />
          )
        }
      }))}
    />
  );
};

export default TenderifyMappingAccordion;
