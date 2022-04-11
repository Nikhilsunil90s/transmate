const directives = {};

export const createUploadsDirective = (name, storageType, options) => {
  const directive = directives[name] || {};
  directives[name] = directive;
  Object.assign(directive, {
    storageType,
    options
  });
};

export const signUploadsDirective = ({ directive, file, meta }, context) => {
  const { authorize, key: genKey, acl } = directives[directive].options;
  if (!authorize({ file, meta }, context)) return false;

  const key = genKey(file, meta);

  return {
    key,
    acl
  };
};

export const setUploadsFileRestrictions = (
  name,
  { allowedFileTypes, maxSize }
) => {
  const directive = directives[name] || {};
  directives[name] = directive;
  Object.assign(directive, {
    allowedFileTypes,
    maxSize
  });
};

/**
 * @returns {[boolean, string?]}
 */
export const validateUploadsRestrictions = (directive, { size, type }) => {
  const { allowedFileTypes, maxSize } = directives[directive];

  // allowedFileTypes is string array
  if (
    allowedFileTypes &&
    allowedFileTypes.includes &&
    !allowedFileTypes.includes(type)
  ) {
    return [false, "fileType"];
  }

  // allowedFileTypes is Regex
  if (
    allowedFileTypes &&
    allowedFileTypes.test &&
    !allowedFileTypes.test(type)
  ) {
    return [false, "fileType"];
  }

  if (maxSize && size > maxSize) {
    return [false, "fileSize"];
  }

  return [true];
};
