import React from "react";
import escapeHtml from "escape-html";
import { Text } from "slate";

let i = 0;
const slateKey = () => {
  i += 1;
  return `slate-${i}`;
};

export const initSlateValue = str => {
  let parsed;
  if (typeof str === "string") {
    try {
      parsed = JSON.parse(str);
    } catch (e) {
      console.warn("Not able to parse slate:", str);
    }
  }
  return parsed;
};

export const serialize = node => {
  if (Text.isText(node)) {
    let txt = escapeHtml(node.text);
    if (node.bold) {
      txt = <b key={slateKey()}>{txt}</b>;
    }
    return txt;
  }

  const children = node.children.map(n => serialize(n));

  switch (node.type) {
    case "h1":
      return <h1 key={slateKey()}>{children}</h1>;
    case "h2":
      return <h2 key={slateKey()}>{children}</h2>;
    case "quote":
      return (
        <blockquote key={slateKey()}>
          <p>{children}</p>
        </blockquote>
      );
    case "paragraph":
      return <p key={slateKey()}>{children}</p>;
    case "link":
      return (
        <a href={escapeHtml(node.url)} key={slateKey()}>
          {children}
        </a>
      );
    default:
      return children;
  }
};

export const serializeSlateString = slateString => {
  const slateValue = initSlateValue(slateString);
  return slateValue ? slateValue.map(node => serialize(node)) : "";
};
