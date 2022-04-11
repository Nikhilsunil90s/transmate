import React from "react";
import {
  GeneralSection,
  TimeLineSection,
  FAQSection,
  ContactSection,
  DocumentSection
} from "../segments";

const TenderGeneralTab = ({ ...props }) => {
  const { tender } = props;
  return (
    <>
      <GeneralSection {...props} />
      {tender && (
        <>
          {<TimeLineSection {...props} />}
          {<FAQSection {...props} />}
          {<DocumentSection {...props} />}
          {<ContactSection {...props} />}
        </>
      )}
    </>
  );
};

export default TenderGeneralTab;
