import React from "react";

import { AutoField, LongTextField } from "uniforms-semantic";

const GeneralTab = () => {
  return (
    <>
      <AutoField name="name" />
      <LongTextField name="description" />

      <AutoField name="website" />
    </>
  );
};

export default GeneralTab;
