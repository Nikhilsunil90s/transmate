class HeaderMappingTable {
  constructor({ mappingH }) {
    this.mappingH = mappingH || {};
    this.headers = Object.entries(this.mappingH).map(([headerMapKey, v]) => ({
      headerMapKey,
      ...v
    }));
    this.mappedHeaders = this.headers.filter(m => !!m.target);
    this.unmappedHeaders = this.headers.filter(m => !m.target);
    this.unmappedOptions = this.unmappedHeaders.map(m => ({
      value: m.headerMapKey, // column id
      text: m.origin
    }));
  }
}

export { HeaderMappingTable };
