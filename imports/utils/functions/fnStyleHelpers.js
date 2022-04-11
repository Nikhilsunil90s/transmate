/* eslint-disable consistent-return */
// helper that sets general css rules for styling (once)
export const updateCSS = function updateCss(selector, rule) {
  const stylesheet = document.styleSheets[1];
  if (stylesheet.insertRule) {
    return stylesheet.insertRule(selector + rule, stylesheet.cssRules.length);
  }
  if (stylesheet.addRule) {
    return stylesheet.addRule(selector, rule, -1);
  }
};

export const appendStyle = function appendStyle(cssRule) {
  const style = $(`<style type='text/css'>${cssRule}</style>`);
  return $("html > head").append(style);
};

export const getContrastYIQ = hexcolor => {
  const hexcolorStr = hexcolor.replace(/^#/, "");
  const r = parseInt(hexcolorStr.substr(0, 2), 16);
  const g = parseInt(hexcolorStr.substr(2, 2), 16);
  const b = parseInt(hexcolorStr.substr(4, 2), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  if (yiq >= 128) {
    return "black";
  }
  return "white";
};
