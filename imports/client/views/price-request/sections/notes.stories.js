import React from "react";

import PageHolder from "../../../components/utilities/PageHolder";
import PriceRequestNotes from "./Notes.jsx";

import { dummyProps } from "../utils/storydata";

export default {
  title: "PriceRequest/Segments/notes"
};

export const basic = () => {
  const props = { ...dummyProps };
  props.priceRequest.notes = `[{"children":[{"text":"Header 1"}],"type":"heading-one"},{"children":[{"text":"Test "},{"text":"with","italic":true},{"text":" "},{"text":"some","underline":true},{"text":" "},{"text":"features","bold":true}]},{"children":[{"text":"list:"}]},{"children":[{"children":[{"text":"test"}],"type":"list-item"}],"type":"numbered-list"},{"children":[{"text":"list 2"}],"type":"paragraph"},{"children":[{"children":[{"text":"bullet item"}],"type":"list-item"}],"type":"bulleted-list"},{"children":[{"text":"test"}],"type":"block-quote"}]`;
  return (
    <PageHolder main="PriceRequest">
      <PriceRequestNotes {...props} />
    </PageHolder>
  );
};

export const empty = () => {
  const props = {
    ...dummyProps
  };
  props.priceRequest.notes = undefined;
  return (
    <PageHolder main="PriceRequest">
      <PriceRequestNotes {...props} />
    </PageHolder>
  );
};

export const readOnly = () => {
  const props = {
    ...dummyProps
  };
  props.priceRequest.notes = `[{"children":[{"text":"Header 1"}],"type":"heading-one"},{"children":[{"text":"Test "},{"text":"with","italic":true},{"text":" "},{"text":"some","underline":true},{"text":" "},{"text":"features","bold":true}]},{"children":[{"text":"list:"}]},{"children":[{"children":[{"text":"test"}],"type":"list-item"}],"type":"numbered-list"},{"children":[{"text":"list 2"}],"type":"paragraph"},{"children":[{"children":[{"text":"bullet item"}],"type":"list-item"}],"type":"bulleted-list"},{"children":[{"text":"test"}],"type":"block-quote"}]`;
  props.security.canEditMasterNote = false;
  return (
    <PageHolder main="PriceRequest">
      <PriceRequestNotes {...props} />
    </PageHolder>
  );
};
