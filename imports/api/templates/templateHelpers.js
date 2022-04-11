/* eslint-disable no-continue */
/* eslint-disable no-restricted-syntax */
import set from "lodash.set";

export const getHBValues = text => {
  const re = /{{[{]?(.*?)[}]?}}/g;
  const tags = [];
  let matches;
  // eslint-disable-next-line no-cond-assign
  while (Boolean((matches = re.exec(text)))) {
    if (matches) {
      tags.push(matches[1]);
    }
  }
  const root = {};
  let context = root;
  const stack = [];
  const setVar = (variable, val) => {
    // Dot Notation Breakdown
    if (variable.match(/\.*\./) && !variable.match(/\s/)) {
      const notation = variable.split(".");
      set(context, notation, `data-${notation}`);
    } else {
      context[variable.trim()] = val;
    }
  };
  for (const tag of tags) {
    if (tag.startsWith("! ")) {
      continue;
    }
    if (tag === "else") {
      continue;
    }
    if ("#^".includes(tag[0]) && !tag.includes(" ")) {
      setVar(tag.substr(1), true);
      stack.push(context);
      continue;
    }
    if (tag.startsWith("#if")) {
      const vars = tag.split(" ").slice(1);
      for (const v of vars) {
        setVar(v, true);
      }
      stack.push(context);
      continue;
    }
    if (tag.startsWith("/if")) {
      context = stack.pop();
      continue;
    }
    if (tag.startsWith("#with ")) {
      const v = tag.split(" ")[1];
      const newContext = {};
      context[v] = newContext;
      stack.push(context);
      context = newContext;
      continue;
    }
    if (tag.startsWith("/with")) {
      context = stack.pop();
      continue;
    }
    if (tag.startsWith("#unless ")) {
      const v = tag.split(" ")[1];
      setVar(v, true);
      stack.push(context);
      continue;
    }
    if (tag.startsWith("/unless")) {
      context = stack.pop();
      continue;
    }
    if (tag.startsWith("#each ")) {
      const v = tag.split(" ")[1];
      const newContext = {};
      context[v] = [newContext];
      stack.push(context);
      context = newContext;
      continue;
    }
    if (tag.startsWith("/each")) {
      context = stack.pop();
      continue;
    }
    if (tag.startsWith("/")) {
      context = stack.pop();
      continue;
    }
    setVar(tag, `data-${tag}`);
  }

  return root;
};
