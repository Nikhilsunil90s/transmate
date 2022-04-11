const debug = require("debug")("generate-html");
const Handlebars = require("handlebars/dist/cjs/handlebars");
const { htmlToText } = require("html-to-text");
const isHtml = require("is-html");

export const createHtml = ({ template, data }) => {
  debug("create html from data and template");
  if (typeof template !== "string") throw Error("template not set!");
  if (!isHtml(template)) throw Error("issue with template, not valid html!");
  if (!data || typeof data !== "object") throw Error("template data not set!");
  if (!template.includes("{{") || !template.includes("}}")) {
    throw Error("Template does not include handlebars!");
  }

  // init template
  const handlebars = Handlebars.compile(template);
  const html = handlebars(data);
  if (!isHtml(html)) throw Error("issue with html result, not valid html!");
  const text = htmlToText(html, {
    wordwrap: 150
  });
  return { html, text };
};
