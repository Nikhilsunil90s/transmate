import React from "react";

import PageHolder from "../../../components/utilities/PageHolder";
import NotesTab from "./Notes.jsx";

import { dummyProps } from "../utils/storydata";

export default {
  title: "PriceList/Tabs/notes"
};

export const basic = () => {
  const props = { ...dummyProps };

  return (
    <PageHolder main="PriceList">
      <NotesTab {...props} />
    </PageHolder>
  );
};
