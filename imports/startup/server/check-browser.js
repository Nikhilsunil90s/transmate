/* eslint-disable */
import React from "react";
import ReactDOMServer from "react-dom/server";
import { WebApp } from "meteor/webapp";

WebApp.connectHandlers.use((req, res, next) => {
  const userAgent = req.headers["user-agent"];
  let isIE;
  if (/MSIE/.test(userAgent) || /Trident/.test(userAgent)) {
    isIE = true;
  }

  if (isIE) {
    res.writeHead(200);
    res.end(ReactDOMServer.renderToString(<BrowserSupport />));
  } else {
    next();
  }
});

const BrowserSupport = () => {
  return (
    <div style={mainDivStyle}>
      <div style={innerDivStyle}>
        <h1>Sorry about this</h1>
        <p>
          We currently don't support your browser version (Internet Explorer).
          <br /> Use or install one of the following:
        </p>
      </div>
      <ul style={ulTagStyle}>
        <li style={liTagStyle}>
          <a
            style={anchorTagStyle}
            href="https://www.google.com/intl/en/chrome/browser/"
          >
            Chrome
          </a>
        </li>
        <li style={liTagStyle}>
          <a style={anchorTagStyle} href="https://www.mozilla.org/firefox/all/">
            Firefox
          </a>
        </li>
        <li style={liTagStyle}>
          <a
            style={anchorTagStyle}
            href="https://microsoft-edge.en.softonic.com/"
          >
            Edge
          </a>
        </li>
        <li style={liTagStyle}>
          <a style={anchorTagStyle} href="https://www.apple.com/safari">
            Safari
          </a>
        </li>
      </ul>
    </div>
  );
};

const mainDivStyle = {
  width: "300px",
  margin: "0 auto"
};

const innerDivStyle = {
  textAlign: "center",
  fontSize: "12px"
};

const ulTagStyle = {
  listStyle: "none",
  fontSize: "10px",
  padding: "0",
  textAlign: "center"
};

const liTagStyle = {
  paddingBottom: "10px"
};

const anchorTagStyle = {
  color: "#151313",
  padding: "14px 25px",
  textAlign: "center",
  textDecoration: "none",
  display: "inline-block",
  border: "1px solid",
  borderRadius: "8px",
  width: "80%",
  fontSize: "12px"
};
