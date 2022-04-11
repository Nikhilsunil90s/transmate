/* eslint-disable no-param-reassign */
let i;
export function objAssignDeep(obj, value, path) {
  let pathArr = [];
  if (Array.isArray(path)) {
    pathArr = path;
  } else {
    pathArr = path.split(".");
  }
  for (i = 0; i < pathArr.length - 1; i += 1) {
    obj = obj[pathArr[i]];
  }

  obj[pathArr[i]] = value;
}
