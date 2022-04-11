import React from "react";
import { Segment, Placeholder } from "semantic-ui-react";

export const PlaceholderBlock = () => (
  <Placeholder>
    <Placeholder.Header>
      <Placeholder.Line />
      <Placeholder.Line />
    </Placeholder.Header>
    <Placeholder.Paragraph>
      <Placeholder.Line />
      <Placeholder.Line />
      <Placeholder.Line />
      <Placeholder.Line />
    </Placeholder.Paragraph>
  </Placeholder>
);

const SegmentPlaceholder = () => (
  <Segment padded="very">
    <PlaceholderBlock />
  </Segment>
);

export default SegmentPlaceholder;
