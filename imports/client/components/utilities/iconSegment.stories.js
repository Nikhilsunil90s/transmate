import React from "react";

import { IconSegment, SegmentFooter } from "./IconSegment";
import PageHolder from "/imports/client/components/utilities/PageHolder";
import Loader from "/imports/client/components/utilities/Loader.jsx";

export default {
  title: "Components/segments"
};

export const simple = () => {
  const props = {
    name: "test",
    icon: "marker",
    title: "test",
    body: <div>TestDiv</div>
  };
  return (
    <PageHolder main="AccountPortal">
      <IconSegment {...props} />
    </PageHolder>
  );
};

export const withFooter = () => {
  const props = {
    name: "test",
    icon: "marker",
    title: "test",
    body: <div>TestDiv</div>,
    footerElement: <SegmentFooter btnText="edit" />
  };
  return (
    <PageHolder main="AccountPortal">
      <IconSegment {...props} />
    </PageHolder>
  );
};

export const withFooterAndPopup = () => {
  const props = {
    name: "test",
    icon: "marker",
    title: "test",
    body: <div>TestDiv</div>,
    footerElement: <SegmentFooter as="footer" btnText="edit" />
  };
  return (
    <PageHolder main="AccountPortal">
      <IconSegment {...props} />
    </PageHolder>
  );
};

// export const withHeaderBtn = () => {
//   const props = {
//     name: "test",
//     icon: "marker",
//     title: "test",
//     body: <div>TestDiv</div>
//   };
//   return (
//     <PageHolder main="AccountPortal">
//       <IconSegment {...props} />
//     </PageHolder>
//   );
// };

export const loadingState = () => {
  const props = {
    name: "test",
    icon: "marker",
    title: "test",
    body: (
      <>
        <Loader loading />
        <div>TestDiv</div>
      </>
    )
  };
  return (
    <PageHolder main="AccountPortal">
      <IconSegment {...props} />
    </PageHolder>
  );
};
