import React from "react";
import { Segment } from "semantic-ui-react";

interface Props {
  footerContent: React.ReactNode;
  children: React.ReactNode;
}

const SectionWithFooter = ({ footerContent, children }: Props) => {
  return (
    <Segment
      as="section"
      padded="very"
      content={
        <>
          {children || null}
          <Segment as="footer" content={footerContent || null} />
        </>
      }
    />
  );
};

export default SectionWithFooter;
