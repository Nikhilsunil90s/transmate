export const generateSettings = settings => ({
  ...settings,
  headerMappingOptions: (settings.mappingKeys || []).map(o => ({
    value: o.k,
    text: o.label
  }))
});
