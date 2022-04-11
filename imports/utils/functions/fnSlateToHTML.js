import escapeHtml from "escape-html";
import { Text } from "slate";

const initSlateValue = str => {
  let parsed;
  if (typeof str === "string") {
    try {
      parsed = JSON.parse(str);
    } catch (e) {
      console.warn("not able to init/convert slate!");
    }
  }
  return parsed;
};

const serialize = node => {
  if (Text.isText(node)) {
    let txt = node.text;
    if (node.bold) {
      txt = `<b>${txt}</b>`;
    }
    return txt;
  }

  const children = node.children.map(n => serialize(n)).join("");

  switch (node.type) {
    case "quote":
      return `<blockquote><p>${children}</p></blockquote>`;
    case "paragraph":
      return `<p>${children}</p>`;
    case "link":
      return `<a href="${escapeHtml(node.url)}">${children}</a>`;
    default:
      return children;
  }
};

export const serializeSlateToHTMLString = slateString => {
  const slateValue = initSlateValue(slateString);
  return slateValue ? slateValue.map(node => serialize(node)).join("") : "";
};
