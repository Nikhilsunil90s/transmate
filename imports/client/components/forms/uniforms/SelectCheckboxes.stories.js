import React from "react";

// import { AutoForm, SubmitField } from "uniforms-semantic";

import PageHolder from "../../utilities/PageHolder";
import { SelectCheckboxes } from "./SelectCheckboxes.jsx";

export default {
  title: "Components/Forms/SelectCheckboxes"
};

export const standalone = () => {
  const options = [
    { id: "1", label: "text1" },
    { id: "2", label: "text2" },
    { id: "3", label: "text3" }
  ];
  const value = ["1"];
  return (
    <PageHolder main="AccountPortal">
      <SelectCheckboxes options={options} value={value} />
    </PageHolder>
  );
};
