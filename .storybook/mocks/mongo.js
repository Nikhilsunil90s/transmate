class Collection {
  constructor() {
    this.before = {
      insert: () => {},
      update: () => {},
      upsert: () => {}
    };
  }
  attachSchema() {}
  insert() {}
  findOne() {}
  find() {
    return {
      fetch: () => []
    };
  }
}
const Mongo = {
  Collection
};

export { Mongo };
