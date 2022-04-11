const mapKeysForObject = (object = {}, keyMaps = []) => {
  const updatedObject = { ...object };

  keyMaps.forEach((keyMap = {}) => {
    const { key, map } = keyMap;
    updatedObject[map] = object[key];

    delete updatedObject[key];
  });

  return updatedObject;
};

export default mapKeysForObject;
