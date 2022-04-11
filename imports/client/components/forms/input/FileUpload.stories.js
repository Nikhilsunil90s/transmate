import React from "react";

import PageHolder from "/imports/client/components/utilities/PageHolder";
import FileUpload from "/imports/client/components/forms/input/FileUpload.jsx";

export default {
  title: "Components/Forms/fileupload"
};

// as part of a uniforms:
export const basic = () => {
  const props = {
    name: "test",
    label: "upload",
    onChange: () => {}
  };
  return (
    <PageHolder main="AccountPortal">
      <FileUpload {...props} />
    </PageHolder>
  );
};
