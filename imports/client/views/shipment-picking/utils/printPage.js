/* eslint-disable no-underscore-dangle */
import ReactDOMServer from "react-dom/server";

export const printPage = el => {
  const html = ReactDOMServer.renderToStaticMarkup(el);
  const oHideFrame = document.createElement("iframe");

  oHideFrame.style.position = "fixed";
  oHideFrame.style.right = "0";
  oHideFrame.style.bottom = "0";
  oHideFrame.style.width = "0";
  oHideFrame.style.height = "0";
  oHideFrame.style.border = "0";
  document.body.appendChild(oHideFrame);

  const pri = oHideFrame.contentWindow;
  pri.document.open();
  pri.document.write(`
  <html lang="en">
    <head>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/semantic-ui/2.4.1/semantic.min.css" />
    </head>
    <body>${html}</body>
  </html>
`);
  pri.document.close();
  pri.focus();
  pri.print();
  document.body.removeChild(oHideFrame);
};
