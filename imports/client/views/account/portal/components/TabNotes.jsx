import React from "react";
import { RichTextField } from "/imports/client/components/forms/uniforms";

const GeneralTab = () => {
  return (
    <>
      <RichTextField
        name="notes"
        style={{
          height: 500
        }}
      />
    </>
  );
};

export default GeneralTab;
