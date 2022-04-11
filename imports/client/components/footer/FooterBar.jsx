import React from "react";

const FooterBar = props => {
  const { children } = props;

  return (
    <footer
      className="ui segment footer_footerbar"
      style={{ position: "fixed", bottom: 0, width: "calc(100% - 60px)" }}
    >
      {children}
    </footer>
  );
};

export default FooterBar;
